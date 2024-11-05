insert into settings (key, value) values ('MAIN_PAGE_SEO', '{"en":[],"ru":[]}');
insert into settings (key, value) values ('FAQ_SEO', '{"en":[],"ru":[]}');
insert into settings (key, value) values ('RULES_SEO', '{"en":[],"ru":[]}');

insert into settings (key, value) values ('MINES_SEO', '{"en":[],"ru":[]}');
insert into settings (key, value) values ('DICE_SEO', '{"en":[],"ru":[]}');
insert into settings (key, value) values ('CRASH_SEO', '{"en":[],"ru":[]}');
insert into settings (key, value) values ('ROULETTE_SEO', '{"en":[],"ru":[]}');
insert into settings (key, value) values ('BATTLE_SEO', '{"en":[],"ru":[]}');
insert into settings (key, value) values ('JACKPOT_SEO', '{"en":[],"ru":[]}');
insert into settings (key, value) values ('HILO_SEO', '{"en":[],"ru":[]}');

insert into settings (key, value) values ('FAQ_PAGE_CONTENT', '{"en":[],"ru":[]}');
insert into settings (key, value) values ('RULES_PAGE_CONTENT', '{"en":[],"ru":[]}');

insert into settings (key, value) values ('BASE_URL', 'http://localhost:8080');
insert into settings (key, value) values ('ACTIVE_BANK_CALLBACK_URL', 'http://localhost:8080');

insert into settings (key, value) values ('MAIN_PAGE_FULL_BLOCK_CONTENT', '{"en":{},"ru":{}}');

insert into settings (key, value) values ('PAYMENT_OUTCOME_EMAILS', '["dmakhnach@yandex.ru"]');

insert into settings (key, value) values ('CHAT_LAST_COUNT_MESSAGES', '100');
insert into settings (key, value) values ('CHAT_MUTE_TIME', '20');
insert into settings (key, value) values ('CHAT_IS_MUCH_WRITE_WITHOUT_PAYMENT', 'false');

insert into settings (key, value) values ('MAIN_PAGE_STATISTICS_TOTAL_GAMES', '10');

insert into settings (key, value) values ('AVAILABLE_GAMES', '[]');

insert into settings (key, value) values ('PAYMENT_BONUS_FIRST_PAY_COUNT_ACTIVATION', '5');
insert into settings (key, value) values ('PAYMENT_BONUS_FIRST_PAY_AMOUNT', '25');
insert into settings (key, value) values ('ACTIVE_PAYMENT_SYSTEM', 0);
insert into settings (key, value) values ('PAYMENT_INCOME_COMMISSION', 0);
insert into settings (key, value) values ('PAYMENT_OUTCOME_COMMISSION', 3);
insert into settings (key, value) values ('START_BALANCE', 5);

insert into settings (key, value) values ('SOCIAL_FACEBOOK', 'http://localhost');
insert into settings (key, value) values ('SOCIAL_VKONTAKTE', 'http://localhost');
insert into settings (key, value) values ('SOCIAL_TELEGRAM', 'http://localhost');
insert into settings (key, value) values ('SOCIAL_TELEGRAM_SUPPORT', 'http://localhost');

insert into settings (key, value) values ('DICE_BET_COMMISSION', 2);
insert into settings (key, value) values ('DICE_DEFAULT_WIN_CHANCE', 50);
insert into settings (key, value) values ('DICE_MIN_WIN_CHANCE', 5);
insert into settings (key, value) values ('DICE_MAX_WIN_CHANCE', 90);
insert into settings (key, value) values ('DICE_BONUS_CHANCE', 5);
insert into settings (key, value) values ('DICE_BONUS_2_CHANCE', 1);
insert into settings (key, value) values ('DICE_CHANCE_DEGRADATION', 10);

insert into settings (key, value) values ('HILO_WIN_COMMISSION', 10);
insert into settings (key, value) values ('MINES_WIN_COMMISSION', 5);
insert into settings (key, value) values ('CRASH_WIN_COMMISSION', 5);
insert into settings (key, value) values ('ROULETTE_WIN_COMMISSION', 5);
insert into settings (key, value) values ('DICE_WIN_COMMISSION', 5);

insert into settings (key, value) values ('BATTLE_GAIN_COMMISSION', 20);
insert into settings (key, value) values ('JACKPOT_GAIN_COMMISSION', 10);

insert into settings (key, value) values ('CRASH_FAIL_S', 73);
insert into settings (key, value) values ('CRASH_FAIL_M', 80);
insert into settings (key, value) values ('CRASH_FAIL_B', 102);
insert into settings (key, value) values ('CRASH_FAIL_H', 65);
insert into settings (key, value) values ('CRASH_FAIL_U', 100);

insert into settings (key, value) values ('ROULETTE_TIME_TO_ACTION_SECONDS', 5);

insert into settings (key, value) values ('TEAM_GAME_GAIN_COMMISSION', 20);

insert into settings (key, value) values ('BONUS_PAYMENT', '2');
insert into settings (key, value) values ('BONUS_EVERY_DAY_CHEST_PRIZE', '1000');
insert into settings (key, value) values ('BONUS_ONE_TIME', '[]');
insert into settings (key, value) values ('BONUS_EVERY_DAY_CHEST_COUNT_DIAMOND_NEED_FOR_OPEN', '50');
insert into settings (key, value) values ('BONUS_EVERY_DAY_QUESTS', '{
  "en":[
    {"title":"VK identification","gainId":1,"id":0},
    {"title":"Subscription to VK group","gainId":2,"id":1},
    {"title":"Subscribe to VK newsletter","gainId":3,"id":2},
    {"title":"Subscribing to PUSH notifications","gainId":4,"id":3},
    {"title":"Subscription to the Telegram channel","gainId":5,"id":4},
    {"title":"Top up balance for 100 rubles","gainId":6,"id":5},
    {"title":"Top up balance by 300 rubles","gainId":7,"id":6},
    {"title":"Top up balance by 500 rubles","gainId":8,"id":7},
    {"title":"Top up balance by 1000 rubles","gainId":9,"id":8},
    {"title":"Top up balance by 1500 rubles","gainId":10,"id":9},
    {"title":"Top up balance by 2000 rubles","gainId":11,"id":10},
    {"title":"Top up balance by 3000 rubles","gainId":12,"id":11},
    {"title":"Top up balance by 5000 rubles","gainId":13,"id":12}
  ],
  "ru":[
    {"title":"Идентификация по ВК","gainId":1,"id":0},
    {"title":"Подписка на группу ВК","gainId":2,"id":1},
    {"title":"Подписка на рассылку ВК","gainId":3,"id":2},
    {"title":"Подписка на PUSH уведомления","gainId":4,"id":3},
    {"title":"Подписка на Телеграм канал","gainId":5,"id":4},
    {"title":"Пополнить баланс на 100 рублей","gainId":6,"id":5},
    {"title":"Пополнить баланс на 300 рублей","gainId":7,"id":6},
    {"title":"Пополнить баланс на 500 рублей","gainId":8,"id":7},
    {"title":"Пополнить баланс на 1000 рублей","gainId":9,"id":8},
    {"title":"Пополнить баланс на 1500 рублей","gainId":10,"id":9},
    {"title":"Пополнить баланс на 2000 рублей","gainId":11,"id":10},
    {"title":"Пополнить баланс на 3000 рублей","gainId":12,"id":11},
    {"title":"Пополнить баланс на 5000 рублей","gainId":13,"id":12}
  ],
  "gainIds":{
    "1":30,
    "2":30,
    "3":30,
    "4":30,
    "5":30,
    "6":30,
    "7":30,
    "8":30,
    "9":30,
    "10":30,
    "11":30,
    "12":30,
    "13":30
  }
}');