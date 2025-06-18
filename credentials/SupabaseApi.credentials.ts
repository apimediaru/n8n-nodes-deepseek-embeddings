import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SupabaseApi implements ICredentialType {
	name = 'supabaseApi';
	displayName = 'Supabase API';
	properties: INodeProperties[] = [
		{
			displayName: 'Supabase URL',
			name: 'url',
			type: 'string',
			default: '',
			placeholder: 'https://your-project.supabase.co',
		},
		{
			displayName: 'Service Role Key',
			name: 'serviceRole',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];
}
