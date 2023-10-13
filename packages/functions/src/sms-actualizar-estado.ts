import { updateStatus } from "./dynamo-helper";
import { estadosSms } from "./estados";

type HandleInput = {
    smsId: string;
  }

  export const handler = async (input: any) => {
    // guardar en dynamo el estado
    console.log("## input ->",input);
    const id = input.Payload.smsId;
    console.log("paso antes del update started id-> ", id);
    console.log("paso antes del update started estado-> ", estadosSms.started);

    
    await updateStatus(id, estadosSms.started);
    //await Save(params, table );
    return {
      id: input.smsId,
    }
  };