import {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	NodeOperationError
} from 'n8n-workflow'; // Убрали jsonParse

import {
	deepseekApiRequest
} from './GenericFunctions';

import { createClient } from '@supabase/supabase-js'; // Для Supabase

export class DeepseekVectorStore implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DeepSeek Vector Store',
		name: 'deepseekVectorStore',
		icon: 'file:deepseek.svg',
		group: ['transform'],
		version: 1,
		description: 'Generate embeddings with DeepSeek and store in vector database',
		defaults: {
			name: 'DeepSeek Vector Store',
		},
		credentials: [
			{
				name: 'deepseekApi',
				required: true,
			},
			{
				name: 'supabaseApi',
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
				displayName: 'Supabase Table',
				name: 'table',
				type: 'string',
				default: 'documents',
				description: 'Table name in Supabase',
			},
			{
				displayName: 'Content Column',
				name: 'contentColumn',
				type: 'string',
				default: 'content',
				description: 'Name of content column',
			},
			{
				displayName: 'Embedding Column',
				name: 'embeddingColumn',
				type: 'string',
				default: 'embedding',
				description: 'Name of embedding vector column',
			},
			{
				displayName: 'Metadata Column',
				name: 'metadataColumn',
				type: 'string',
				default: 'metadata',
				description: 'Name of metadata column',
			},
		],
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnData = [];

		for (let i = 0; i < items.length; i++) {
			try {
				// Получаем параметры
				const text = this.getNodeParameter('text', i) as string;
				const model = this.getNodeParameter('model', i) as string;
				const table = this.getNodeParameter('table', i) as string;
				const contentColumn = this.getNodeParameter('contentColumn', i) as string;
				const embeddingColumn = this.getNodeParameter('embeddingColumn', i) as string;
				const metadataColumn = this.getNodeParameter('metadataColumn', i) as string;

				// Генерируем эмбеддинг
				const response = await deepseekApiRequest.call(this, {
					method: 'POST',
					endpoint: '/embeddings',
					body: {
						model,
						input: text,
					},
				});

				const embedding = response.data[0].embedding;

				// Получаем credentials для Supabase
				const supabaseCredentials = await this.getCredentials('supabaseApi');

				// Создаем клиент Supabase
				const supabase = createClient(
					supabaseCredentials.url as string,
					supabaseCredentials.serviceRole as string
				);

				// Сохраняем в векторную базу
				const { data, error } = await supabase
					.from(table)
					.insert([{
						[contentColumn]: text,
						[embeddingColumn]: embedding,
						[metadataColumn]: {
							model,
							generated_at: new Date().toISOString()
						}
					}])
					.select();

				if (error) {
					throw new NodeOperationError(this.getNode(), `Supabase error: ${error.message}`);
				}

				returnData.push({
					json: {
						id: data[0].id,
						content: text,
						embedding,
						status: 'success'
					}
				});

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
