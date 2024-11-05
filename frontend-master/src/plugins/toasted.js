import Toasted from 'vue-toasted';
import { Vue } from '../main'
import { getCookie } from '../utils/getCookie';

Vue.use(Toasted)

Vue.toasted.register('error', (payload) => {
		const current_language = getCookie('lang') || 'ru'
		const main_message = current_language === 'en' ? 'Some error...' : 'Ошибка...'

		if(!payload) {
			return main_message
		}

		return `${main_message}<br>` + payload;
	},
	{
		duration: 10000,
		type: 'error'
	}
)

Vue.toasted.register('success', payload => payload,
	{
		duration: 3000,
		type: 'success'
	}
)
