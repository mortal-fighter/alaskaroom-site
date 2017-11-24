var searchCriterias = {
	post: {
		type: [{
			name: 'Квартиру или румейта',
			value: 'all',
			selected: true
		}, {
			name: 'Квартиру',
			value: 'find-flat',
			selected: false
		}, {
			name: 'Румейта',
			value: 'find-roommate',
			selected: false
		}]
	},
	user: {
		sex: [{
			name: 'Не важно с кем',
			value: 'не важно',
			selected: true
		}, {
			name:  'Только с девушками',
			value: 'женский',
			selected: false
		}, {
			name:  'Только с парнями',
			value: 'мужской',
			selected: false
		}],
		age: [{
			name: 'Не важен',
			value: 'не важно',
			selected: true
		}, {
			name:  '18-25',
			value: '18-25',
			selected: false
		}, {
			name:  '18-30',
			value: '18-30',
			selected: false
		}],
		socialActivity: [{
			name: 'Не важна',
			value: 'не важно',
			selected: true
		}, {
			name:  'Интроверт',
			value: 'интроверт',
			selected: false
		}, {
			name:  'Экстраверт',
			value: 'экстраверт',
			selected: false
		}],
		badHabbits: [{
			name: 'Не важно',
			value: 'не важно',
			selected: true
		}, {
			name:  'Курит',
			value: 'курение',
			selected: false
		}, {
			name:  'Пьет',
			value: 'алкоголь',
			selected: false
		}, {
			name:  'Курит и пьет',
			value: 'алкоголь и курение',
			selected: false
		}, {
			name:  'Не курит и не пьет',
			value: 'нет',
			selected: false
		}],
		pets: [{
			name: 'Не важно',
			value: 'не важно',
			selected: true
		}, {
			name:  'Небольшие только',
			value: 'небольшие только',
			selected: false
		}, {
			name:  'Обожаю живность',
			value: 'обожаю живность',
			selected: false
		}],
		car: [{
			name: 'Не важно',
			value: 'не важно',
			selected: true
		}, {
			name:  'Есть',
			value: 1,
			selected: false
		}, {
			name:  'Нет',
			value: 0,
			selected: false
		}],
		university: [{
			name: 'Не важно',
			value: 'не важно',
			selected: true
		}, {
			name:  'РИНХ',
			value: 'РИНХ',
			selected: false
		}, {
			name:  'ЮФУ',
			value: 'ЮФУ',
			selected: false
		}],
		success: [{
			name: 'Не важно',
			value: 'не важно',
			selected: true
		}, {
			name:  'Хорошист',
			value: 'хорошист',
			selected: false
		}, {
			name:  'Отличник',
			value: 'отличник',
			selected: false
		}]
	}
};

module.exports = searchCriterias;