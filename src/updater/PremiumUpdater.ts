import amqp from 'amqplib/callback_api'
import Factory from '../Factory';
import { RabbitMQ } from '../Constants';
import Premium from '../structures/Premium';
import { PremiumStatus } from '../models/Premium';
import { parseObjectDate } from '../utils/DateTimeHelper';
import Logger from '../utils/Logger';

export default class PremiumUpdater extends Factory{

    private logger: Logger = new Logger('rabbit')

    start(): void{
        amqp.connect(process.env.AMQP_CONN_URL, (err, connection) => {
            if(err){
                this.logger.error(`Colud not connect to RabbitMQ server. Error: ${err.message}`)
                return
            }

            this.logger.info('Successfully connected to RabbitMQ server.')
            connection.createChannel((err, channel) => {
                if(err){
                    this.logger.info(`Failed to create RabbitMQ channel. Error: ${err.message}`)
                }

                channel.assertQueue(RabbitMQ.channels.premium, {
                    durable: false
                })

                this.logger.info('RabbitMQ premium channel has begun to listen.')
                channel.consume(RabbitMQ.channels.premium, async data => {
                    const premium = JSON.parse(data.content.toString())
                    if(premium.server_id){
                        const server = await this.client.servers.get(premium.server_id)
                        if(server){
                            let object = null
                            if(premium.status === PremiumStatus.CONTINUES){
                                // LocalDateTime object to NodeJS Date object convert
                                premium.startAt = parseObjectDate(premium.startAt)
                                premium.finishAt = parseObjectDate(premium.finishAt)

                                object = new Premium(premium)
                            }

                            server.premium = object
                        }
                    }
                }, {
                    noAck: true
                })
            })
        })
    }

}
