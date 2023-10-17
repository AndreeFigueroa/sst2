import { Chain, DefinitionBody, StateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { StackContext, Function, Table, Api, Config } from "sst/constructs";
import { Duration } from "aws-cdk-lib/core";

export function MyStack({ stack }: StackContext) {

  const tableSmsTwillio = new Table(stack, 'twilio_sms',{
    fields:{
      smsId: "string",
    },
    primaryIndex: {partitionKey: "smsId",}
  });

  const enviarMensaje = new LambdaInvoke(stack, "Enviar Mensaje", {
    lambdaFunction: new Function(stack, 'EnviarMensajeFunc', {
      bind: [tableSmsTwillio],
      handler: "packages/functions/src/enviar-mensaje.handler",
    }),
    retryOnServiceExceptions: false,
  });

  const marcarError = new LambdaInvoke(stack, "Marcar error", {
    lambdaFunction: new Function(stack, 'MarcarErrorFunc', {
      bind: [tableSmsTwillio],
      handler: "packages/functions/src/marcar-error.handler",
    }),
  });

  enviarMensaje.addCatch(marcarError, {
    errors: ["States.ALL"],
    resultPath: "$.error",
  });

  enviarMensaje.addRetry({
    errors: ["States.ALL"],
    interval: Duration.seconds(1),
    maxAttempts: 3,
    backoffRate: 2.0,
  });
  
  const smsActualizarEstado = new LambdaInvoke(stack, "Actualizar Estado", {
    lambdaFunction: new Function(stack, 'ActualizarEstadoSmsFunc', {
      bind: [tableSmsTwillio],
      handler: "packages/functions/src/sms-actualizar-estado.handler",
    }),
    retryOnServiceExceptions: false,
  });


  const stateMachine = new StateMachine(stack, "StateMachineSMS", {
    tracingEnabled: false,
    definitionBody: DefinitionBody.fromChainable(
      Chain.start(enviarMensaje).next(smsActualizarEstado)
    )
  });
  
  const api = new Api(stack, "api", {
    defaults: {
      function: {
        bind: [tableSmsTwillio],
        environment:{
          StateMachine: stateMachine.stateMachineArn,
        }
      },
    },
    routes: {
      "POST /sms": "packages/functions/src/enviar-mensaje.handler",
    },
    
  });

  api.attachPermissionsToRoute("POST /sms", [
    [stateMachine, "grantStartExecution"],
  ]);
  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  
};
