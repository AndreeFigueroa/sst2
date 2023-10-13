import { randomUUID } from "crypto"
import { sendMessage } from "./sms-twilio"
import { estadosSms } from "./estados"
import { save, paramsTableSms } from "./dynamo-helper"

type InputTwilio = {
    from: string,
    to: string,
    message: string
    clientName: string
}

type HandleOutput = {
    smsId: string
}

export const handler = async (data: any): Promise<HandleOutput> => {
    
    const id = randomUUID();
    console.log('data.body ->',  data.body);
    const paramstwilio : InputTwilio = JSON.parse(data.body);
    console.log('paramstwilio ->', paramstwilio);
    
    const response = await sendMessage(paramstwilio)
    const status = estadosSms.pending;

    const paramsDb : paramsTableSms = {
        smsId: id,
        message: paramstwilio.message,
        from: paramstwilio.from,
        to: paramstwilio.to,
        status,
        clientName: paramstwilio.clientName,
        sid_twilio: response.id,
    };
    
    await save(paramsDb);

    return{
        smsId: id,
    }
};