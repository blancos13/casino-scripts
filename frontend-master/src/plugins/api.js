import * as axios from 'axios';

import { getCookie } from '../utils/getCookie';

const httpInstance = axios.create({
	baseURL: process.env.VUE_APP_BASE_URL_API + '/api/',
	timeout: 10000000
});

// Auth
const token = getCookie('token');

if (token && token !== 'Bearer undefined') {
	httpInstance.defaults.headers.authorization = token
}
// Auth

// Interceptors
httpInstance.interceptors.request.use(config => config, function (error) {
	if (error.request) {
		return {
			error: error.request
		}
	} else {
		return {
			error
		}
	}
});
httpInstance.interceptors.response.use(({ data }) => data, function (error) {
	// if (error && error.status === 403)  { Unauthorized
	// 	// if user is not auth
	// }

	if (error.response && error.response.status === 408 || error.code === 'ECONNABORTED') {
		return {
			error: error + ''
		}
	}

	if (error.response && error.response.data && error.response.data.message) {
		return {
			error: error.response.data.message
		}
	}

	return {
		error
	}
});
// Interceptors

const requireComponent = require.context(
	'../services',
	false,
	/[a-z].js/
)

let api = { }

requireComponent.keys().forEach((fn) => {
	const createSerApi = requireComponent(fn).default
	const serName = fn.split('/').pop().replace(/\.\w+$/, '')

	api = Object.assign(api, {
		[serName]: createSerApi(httpInstance)(serName)
	})
})

export {
	httpInstance,
	api
}
