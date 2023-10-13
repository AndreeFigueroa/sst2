const accountSid = "AC3efac73ab6dd63584eb6f60488d34fa7";
const authToken = "38431da0581548d269b06bae8353391d";
//const authToken = "aa09d3045bb014613b3534f1aad83e65";
const phone = "+17605477165";

import { default as twilio } from 'twilio';
import { getSmsById } from './dynamo-helper';

const clientTwilio = twilio(accountSid, authToken);

export type RequestMessage = {
    from: string;
    to: string;
    message: string;
};

export type ResponseMessage = {
    status: string;
    id: string,
    body?: Record<string, any>; //objeto generico {attr: value}
};

export async function sendMessageById(id: string): Promise<ResponseMessage> {
    const result = await getSmsById(id);
    if (!result.Item) {
        throw Error ("No existe el mensaje buscado");
    }
    const res = await clientTwilio.messages
        .create({
            body: result.Item.message,
            from: result.Item.from,
            to: result.Item.to
        });
        
    return {
        status: res.status,
        id: res.sid,
        body: res
    }
    
}

export async function sendMessage(Item: RequestMessage): Promise<ResponseMessage> {
    
    const res = await clientTwilio.messages
        .create({
            body: Item.message,
            from: Item.from,
            to: Item.to
        });
        
    return {
        status: res.status,
        id: res.sid,
        body: res
    }
    
}
/* ts-node --esm packages/functions/src/twiliioSms.ts
(async () => {

    await sendMessage({
        from: phone,
        to: '+56958407719',
        message: 'hola'
    });

})(); */