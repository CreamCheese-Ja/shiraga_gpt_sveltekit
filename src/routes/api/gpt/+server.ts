/** @type {import('./$types').RequestHandler} */
import axios from 'axios';
import { SECRET_API_KEY } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';

type RequestData = {
	message: string;
};

const readStream = async (stream: ReadableStream) => {
	const reader = stream.getReader();
	const result = await reader.read();
	const decoder = new TextDecoder();
	const data: RequestData = JSON.parse(decoder.decode(result.value));
	return data;
};

const API_URL = 'https://api.openai.com/v1/';
const MODEL = 'gpt-3.5-turbo';

export const POST = async (request: RequestEvent) => {
	try {
		if (!request.request.body) {
			throw new Error();
		}

		const data = await readStream(request.request.body);

		if (data.message.length > 100) {
			throw new Error();
		}

		const response = await axios.post(
			`${API_URL}chat/completions`,
			{
				model: MODEL,
				messages: [
					{
						role: 'system',
						content:
							'あなたの名前は「shiragaGPT」です。名前を聞かれたら「shiragaGPT」と答えてください。'
					},
					{
						role: 'user',
						content: data.message
					}
				]
			},
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${SECRET_API_KEY}`
				}
			}
		);

		return new Response(String(response.data.choices[0].message.content));
	} catch (error) {
		return new Response(null);
	}
};