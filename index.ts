import { DeepseekEmbeddings } from './nodes/DeepseekEmbeddings/DeepseekEmbeddings.node';
import { DeepseekApi } from './credentials/DeepseekApi.credentials';

export const nodes = [DeepseekEmbeddings];
export const credentials = [DeepseekApi];
