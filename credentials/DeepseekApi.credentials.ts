import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class DeepseekApi implements ICredentialType {
	name = 'deepseekApi';
	displayName = 'DeepSeek API';
	documentationUrl = 'deepseek';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];
}
