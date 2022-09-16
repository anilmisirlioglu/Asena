import Interaction, { Action } from '../Interaction';
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelType } from 'discord.js';
import Server from '../../structures/Server';
import Raffle from '../../structures/Raffle';
import ID from '../ID';
import { isDevBuild } from '../../utils/Version';

export default class GiveawayInteraction extends Interaction<ButtonInteraction>{

    constructor(){
        super({
            identifier: 'giveaway',
            actions: ['join', 'leave']
        })
    }

    async execute(server: Server, interaction: ButtonInteraction, action: Action){
        const giveaway = await server.raffles.get(action.key == 'join' ? interaction.message.id : action.data.get('giveaway'))
        if(!giveaway){
            return interaction.reply({
                content: server.translate('structures.raffle.not.found'),
                ephemeral: true
            })
        }

        if(giveaway.isFinished()){
            return interaction.reply({
                content: server.translate('structures.raffle.ended'),
                ephemeral: true
            })
        }

        switch(action.key){
            case 'join':
                return this.handleJoin(server, giveaway, interaction)
            case 'leave':
                return this.handleLeave(server, giveaway, interaction)
        }
    }

    private async handleJoin(server: Server, giveaway: Raffle, interaction: ButtonInteraction){
        const userId = interaction.user.id
        if(giveaway.hasParticipant(userId)){
            return interaction.reply({
                content: server.translate('structures.raffle.join.already'),
                ephemeral: true,
                components: [new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(new ID()
                                .setIdentifier('giveaway')
                                .setAction('leave')
                                .addKVPair('giveaway', giveaway.message_id)
                                .toString()
                            )
                            .setLabel(server.translate('structures.raffle.join.leave'))
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId(new ID()
                                .setIdentifier('general')
                                .setAction('cancel')
                                .toString()
                            )
                            .setLabel(server.translate('global.cancel'))
                            .setStyle(ButtonStyle.Success)
                    )]
            })
        }

        if(userId == giveaway.constituent_id && !isDevBuild){
            return interaction.reply({
                content: server.translate('structures.raffle.join.constituent'),
                ephemeral: true
            })
        }

        const servers = giveaway.servers
        if(servers.length > 0){
            const fetchUserFromServers = servers.map(async partial => {
                return this.client.fetchMember(partial.id, userId)
            })

            const fetchServerResult = await Promise.all(fetchUserFromServers)
            if(fetchServerResult.filter(Boolean).length !== servers.length){
                return interaction.reply({
                    content: server.translate('structures.raffle.join.conditions'),
                    ephemeral: true
                })
            }
        }

        const allowedRoles = giveaway.allowedRoles
        if(allowedRoles.length > 0){
            const member = await interaction.guild.members.fetch(userId)
            const allowedRolesResult = allowedRoles.map(role_id => !!member.roles.cache.get(role_id))
            if(allowedRolesResult.filter(item => item).length !== allowedRoles.length){
                return interaction.reply({
                    content: server.translate('structures.raffle.join.conditions'),
                    ephemeral: true
                })
            }
        }

        giveaway.participate(userId).then(async result => {
            if(result){
                await interaction.update(giveaway.getMessageOptions())
            }
        })
    }

    private async handleLeave(server: Server, giveaway: Raffle, interaction: ButtonInteraction){
        const userId = interaction.user.id
        if(!giveaway.hasParticipant(userId)){
            return interaction.update({
                content: server.translate('structures.raffle.leave.already'),
                components: []
            })
        }

        const channel = await interaction.guild.channels.fetch(giveaway.channel_id)
        if(channel.type == ChannelType.GuildText){
            const message = await channel.messages.fetch(giveaway.message_id)
            if(!message){
                return interaction.reply({
                    content: server.translate('structures.raffle.not.found'),
                    ephemeral: true
                })
            }

            giveaway.leave(userId).then(async result => {
                if(result){
                    await Promise.all([
                        message.edit(giveaway.getMessageOptions()),
                        interaction.update({
                            content: server.translate('structures.raffle.leave.successfully'),
                            components: []
                        })
                    ])
                }
            })
        }
    }

}