import {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	NodeOperationError
} from 'n8n-workflow'; // Убрали jsonParse

import {
	deepseekApiRequest
} from './GenericFunctions';

export class DeepseekEmbeddings implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DeepSeek Embeddings',
		name: 'deepseekEmbeddings',
		icon: 'file:deepseek.svg',
		group: ['transform'],
		version: 1,
		description: 'Generate embeddings using DeepSeek API',
		defaults: {
			name: 'DeepSeek Embeddings',
		},
		credentials: [
			{
				name: 'deepseekApi',
				required: true,
			},
		],
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				required: true,
				default: '',
				description: 'Text to generate embeddings for',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				options: [
					{
						name: 'deepseek-embedding-v1',
						value: 'deepseek-embedding-v1',
					},
				],
				default: 'deepseek-embedding-v1',
			},
			{
				displayName: 'Split Into Vectors',
				name: 'splitIntoVectors',
				type: 'boolean',
				default: false,
				description: 'Whether to return each vector as separate item',
			},
			// Исправленное поле для размерности вектора
			{
				displayName: 'Vector Dimensions',
				name: 'vectorDimensions',
				type: 'hidden', // Важно: должно быть hidden
				default: 1024,
				description: 'Dimension of the embedding vectors',
			}
		],
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnData = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const text = this.getNodeParameter('text', i) as string;
				const model = this.getNodeParameter('model', i) as string;
				const splitIntoVectors = this.getNodeParameter('splitIntoVectors', i, false) as boolean;

				const response = await deepseekApiRequest.call(this, {
					method: 'POST',
					endpoint: '/embeddings',
					body: {
						model,
						input: text,
					},
				});

				if (splitIntoVectors) {
					for (const [index, item] of response.data.entries()) {
						returnData.push({
							json: {
								// Стандартные поля для Vector Store
								embedding: item.embedding,
								metadata: {
									text: text,
									model: model,
									index: index
								},
								// Дополнительные поля из ответа
								object: item.object,
							}
						});
					}
				} else {
					// Для единого вывода возвращаем первый вектор
					returnData.push({
						json: {
							embedding: response.data[0].embedding,
							metadata: {
								text: text,
								model: model
							},
							object: response.object,
							usage: response.usage,
							model: response.model
						}
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error);
			}
		}

		return this.prepareOutputData(returnData);
	}
}
