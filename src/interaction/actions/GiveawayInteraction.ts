import {
    ActionRowBuilder,
    bold,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChannelType, hyperlink,
    roleMention
} from 'discord.js';
import Interaction, { Action } from '../Interaction';
import Server from '../../structures/Server';
import Giveaway from '../../structures/Giveaway';
import ID from '../ID';
import { isDevBuild } from '../../utils/Version';
import { Actions } from './enums';

export default class GiveawayInteraction extends Interaction<ButtonInteraction>{

    constructor(){
        super({
            identifier: 'giveaway',
            actions: [
                Actions.Giveaway.Join,
                Actions.Giveaway.Leave
            ]
        })
    }

    async execute(server: Server, interaction: ButtonInteraction, action: Action){
        const giveaway = await server.giveaways.get(action.key == 'join' ? interaction.message.id : action.data.get('giveaway'))
        if(!giveaway){
            return interaction.reply({
                content: server.translate('structures.giveaway.not.found'),
                ephemeral: true
            })
        }

        if(giveaway.isFinished()){
            return interaction.reply({
                content: server.translate('structures.giveaway.ended'),
                ephemeral: true
            })
        }

        switch(action.key){
            case Actions.Giveaway.Join:
                return this.handleJoin(server, giveaway, interaction)
            case Actions.Giveaway.Leave:
                return this.handleLeave(server, giveaway, interaction)
        }
    }

    private async handleJoin(server: Server, giveaway: Giveaway, interaction: ButtonInteraction){
        const userId = interaction.user.id
        if(giveaway.hasParticipant(userId)){
            return interaction.reply({
                content: server.translate('structures.giveaway.join.already'),
                ephemeral: true,
                components: [new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(new ID()
                                .setIdentifier('giveaway')
                                .setAction(Actions.Giveaway.Leave)
                                .addKVPair('giveaway', giveaway.message_id)
                                .toString()
                            )
                            .setLabel(server.translate('structures.giveaway.join.leave'))
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId(new ID()
                                .setIdentifier('general')
                                .setAction(Actions.General.Cancel)
                                .toString()
                            )
                            .setLabel(server.translate('global.cancel'))
                            .setStyle(ButtonStyle.Success)
                    )]
            })
        }

        if(userId == giveaway.constituent_id && !isDevBuild){
            return interaction.reply({
                content: server.translate('structures.giveaway.join.constituent'),
                ephemeral: true
            })
        }

        const servers = giveaway.servers
        if(servers.length > 0){
            const fetchUserFromServers = servers.map(async partial => {
                return this.client.fetchMember(partial.id, userId)
            })

            const fetchServerResult = (await Promise.all(fetchUserFromServers)).filter(Boolean)
            if(fetchServerResult.length !== servers.length){
                const diff = servers.filter(server => !fetchServerResult.map(member => member.guild.id).includes(server.id));
                return interaction.reply({
                    content: server.translate('structures.giveaway.join.conditions.servers', diff.map(server => hyperlink(bold(server.name), server.invite)).join(', ')),
                    ephemeral: true
                })
            }
        }

        const allowedRoles = giveaway.allowedRoles
        if(allowedRoles.length > 0){
            const member = await interaction.guild.members.fetch(userId)
            const roles = allowedRoles.map(roleId => member.roles.cache.get(roleId)).filter(Boolean)
            if(roles.length !== allowedRoles.length){
                const diff = allowedRoles.difference(roles.map(role => role.id))
                return interaction.reply({
                    content: server.translate('structures.giveaway.join.conditions.roles', diff.map(id => roleMention(id)).join(', ')),
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

    private async handleLeave(server: Server, giveaway: Giveaway, interaction: ButtonInteraction){
        const userId = interaction.user.id
        if(!giveaway.hasParticipant(userId)){
            return interaction.update({
                content: server.translate('structures.giveaway.leave.already'),
                components: []
            })
        }

        const channel = await interaction.guild.channels.fetch(giveaway.channel_id)
        if(channel.type == ChannelType.GuildText){
            const message = await channel.messages.fetch(giveaway.message_id)
            if(!message){
                return interaction.reply({
                    content: server.translate('structures.giveaway.not.found'),
                    ephemeral: true
                })
            }

            giveaway.leave(userId).then(async result => {
                if(result){
                    await Promise.all([
                        message.edit(giveaway.getMessageOptions()),
                        interaction.update({
                            content: server.translate('structures.giveaway.leave.successfully'),
                            components: []
                        })
                    ])
                }
            })
        }
    }

}