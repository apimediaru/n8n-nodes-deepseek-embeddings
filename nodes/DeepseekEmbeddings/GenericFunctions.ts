import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
	NodeApiError,
	IHttpRequestMethods,  // Добавляем недостающий тип
	IRequestOptions,      // Добавляем недостающий тип
} from 'n8n-workflow';

interface IDeepseekApiRequestOptions {
	method: IHttpRequestMethods;  // Используем строгий тип
	endpoint: string;             // Заменяем url на endpoint
	body?: any;
	qs?: any;
	headers?: any;
}

export async function deepseekApiRequest(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	options: IDeepseekApiRequestOptions,
) {
	const credentials = await this.getCredentials('deepseekApi');
	const baseUrl = 'https://api.deepseek.com/v1';

	// Формируем корректный объект запроса
	const requestOptions: IRequestOptions = {
		method: options.method,
		uri: `${baseUrl}${options.endpoint}`,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${credentials.apiKey}`,
			...(options.headers || {}),
		},
		body: options.body,
		qs: options.qs,
		json: true,
	};

	try {
		return await this.helpers.request(requestOptions);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}
