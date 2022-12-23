FROM rabbitmq:3.11-management

ADD rabbitmq_delayed_message_exchange-3.11.1.ez /plugins/rabbitmq_delayed_message_exchange-3.11.1.ez
RUN chown rabbitmq:rabbitmq /plugins/rabbitmq_delayed_message_exchange-3.11.1.ez
RUN rabbitmq-plugins enable --offline rabbitmq_delayed_message_exchange
