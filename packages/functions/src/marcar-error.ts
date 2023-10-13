import { updateStatus } from "./dynamo-helper";
import { estadosSms } from "./estados";

type HandleInput ={
    messajeId: string;
  }
  
  export const handler = async (input: HandleInput) => {
    
    await updateStatus(input.messajeId, estadosSms.failed);
    return {}
  };
  