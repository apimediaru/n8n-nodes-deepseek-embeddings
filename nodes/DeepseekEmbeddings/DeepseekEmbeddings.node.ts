import {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	NodeOperationError
} from 'n8n-workflow';

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
					for (const item of response.data) {
						returnData.push({
							json: {
								embedding: item.embedding,
								index: item.index,
							},
						});
					}
				} else {
					returnData.push({
						json: response,
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
