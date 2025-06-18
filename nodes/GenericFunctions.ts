import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
	NodeApiError,
	IHttpRequestMethods,
	IRequestOptions
} from 'n8n-workflow';

interface IDeepseekApiRequestOptions {
	method: IHttpRequestMethods;
	endpoint: string;
	body?: any;
	qs?: any;
}

export async function deepseekApiRequest(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	options: IDeepseekApiRequestOptions,
) {
	const credentials = await this.getCredentials('deepseekApi');
	const baseUrl = 'https://api.deepseek.com/v1';

	const requestOptions: IRequestOptions = {
		method: options.method,
		uri: `${baseUrl}${options.endpoint}`,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${credentials.apiKey}`,
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
