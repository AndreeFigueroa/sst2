
import { DynamoDB } from "aws-sdk";
import { Table } from "sst/node/table";
const dynamoDb = new DynamoDB.DocumentClient();
export function getSmsById (id: string){
    const params: DynamoDB.DocumentClient.GetItemInput = {
        TableName:  Table.twilio_sms.tableName,
        Key: {
            smsId: id
        }
    }
    const result = dynamoDb.get(params).promise();
    return result;
}

export type paramsTableSms = {
    from: string,
    to: string,
    message: string
    smsId: string
    clientName: string
    status: string
    sid_twilio: string
  }
export async function save(params: paramsTableSms) {
    const getParams: any = {
        TableName: Table.twilio_sms.tableName,
        Item: {
            smsId: params.smsId,
            message: params.message,
            from: params.from,
            to: params.to,
            status: params.status,
            client_name: params.clientName,
            sid_twilio: params.sid_twilio,
            created_at: Date.now()
        },
    };
    await dynamoDb.put(getParams).promise();
}

export async function updateStatus(smsId: string, status: string) {
    console.log('updateStatus - smsId ', smsId);
    
    const updateParams: any = {
        TableName: Table.twilio_sms.tableName,
        Key: {
            smsId: smsId
        },
        UpdateExpression: 'set #status = :status ',
        ExpressionAttributeNames: { '#status': "status" },
        ExpressionAttributeValues: {
            ':status': status,
        }
    }
    await dynamoDb.update(updateParams).promise();
}