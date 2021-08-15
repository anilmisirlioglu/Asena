# [Asena](https://asena.xyz) 🤖

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stars](https://img.shields.io/github/stars/anilmisirlioglu/Asena)](https://github.com/anilmisirlioglu/Asena/stargazers)
[![Servers](https://img.shields.io/badge/dynamic/json.svg?label=servers&url=https%3A%2F%2Fdiscord.bots.gg%2Fapi%2Fv1%2Fbots%2F716259870910840832&query=%24.guildCount&colorB=7289DA)](https://discord.com/oauth2/authorize?permissions=347200&scope=bot&client_id=716259870910840832&redirect_uri=https%3A%2F%2Fdiscord.gg%2FCRgXhfs&response_type=code)
[![CodeFactor](https://www.codefactor.io/repository/github/anilmisirlioglu/asena/badge/master)](https://www.codefactor.io/repository/github/anilmisirlioglu/asena/overview/master)
[![Discord](https://discordapp.com/api/guilds/701790578874253363/widget.png?style=shield)](https://discord.gg/CRgXhfs)
[![Version](https://img.shields.io/github/package-json/v/anilmisirlioglu/Asena?color=blue)](https://github.com/anilmisirlioglu/Asena)

> stable, fast, easy and surrounded by new generation technologies Discord giveaway & poll bot!

## Build & Run

> :warning: It should only be used for testing in development.

1. First, install repository
    ```sh
    git clone --branch stable https://github.com/anilmisirlioglu/Asena && cd Asena
    ```

2. Then, set permission and run
    ```sh
    chmod +x ./service-install.sh
    ./service-install.sh --run
    ```

## High-Level Design

![asena-1](https://user-images.githubusercontent.com/20264712/122685996-97ee7500-d217-11eb-9160-8be3751af996.png)

## Multi Language Support

**[EN]** Due to the high usage of the bot on Turkish servers, the default language of the bot is set to *Turkish*.
You can change the language of the bot in the server with the command `!alocale set <language-code>`

**[TR]** Botun yüksek oranda Türk sunucularında kullanılmasından dolayı botun varsıyılan dili *Türkçe* olarak
ayarlanmıştır. Botun sunucu içerisinde ki dilini `!alocale set <dil-kodu>` komutu ile değiştirebilirsiniz.

Example to make the bots default language English:
```sh
!alocale set en
```

## Commands

> Prefix: !a (Default)

| Command | Description |
|:-----------:|:----------:|
| cancel | Cancels the giveaway. |
| create | Starts new giveaway in one line. |
| reroll | Repeat the results of the giveaway. |
| setup | Starts the interactive setup wizard. |
| end | Finish the giveaway early. |
| raffles | List active giveaways on the server. |
| soundaway | Starts a new quick giveaway in the voice channel. |
| vote |  Starts a simple 2-option poll on the server. |
| question | Asks a question. |
| help | Sends the help menu to your inbox via a private message. |
| setprefix | The command changes its prefix. |
| scperm | It regulates the authority of the command. |
| invite | Sends the bots invite URL to the chat. |
| locale | Changes the bots default language. |
| ping | Displays the bot network latency information. |

## Self-Hosting

Asena is software that does not generate revenue. All features are offered for free.
But for those who insist on hosting their own; The reason bot codes are open source is to help other developers who want to code the bot, to see the working principle and to contribute to those who want to solve the bot's software problems. Other than that, you cannot host the bot yourself in any way. This is a violation of rights.
Otherwise, no assistance will be provided to edit, compile or generate any code in this repository.
