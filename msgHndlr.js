/*
* "Wahai orang-orang yang beriman, mengapakah kamu mengatakan sesuatu yang tidak kamu kerjakan?
* Amat besar kebencian di sisi Allah bahwa kamu mengatakan apa-apa yang tidak kamu kerjakan."
* (QS ash-Shaff: 2-3).
*/
const { decryptMedia } = require('@open-wa/wa-decrypt')
const fs = require('fs-extra')
const mime = require('mime-types')
const axios = require('axios')
const moment = require('moment-timezone')
const get = require('got')
const fetch = require('node-fetch')
const color = require('./lib/color')
const { exec } = require('child_process')
const { fb } = require('./lib/functions')
const { help, snk, info } = require('./lib/help')
const { stdout } = require('process')
const nsfw_ = JSON.parse(fs.readFileSync('./lib/NSFW.json'))
const speed = require('performance-now')
const google = require('google-it')
const ytdl = require("ytdl-core")
//const simi = JSON.parse(fs.readFileSync('./settings/simi.json'))
const nrc = require('node-run-cmd')
const downloader = require('./lib/downloader')
const urlShortener = require('./lib/shortener')
const sizeOf = require('image-size')
const { RemoveBgResult, removeBackgroundFromImageBase64, removeBackgroundFromImageFile } = require('remove.bg')

moment.tz.setDefault('America/Sao_Paulo').locale('id')

module.exports = msgHandler = async (client, message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName } = sender
        pushname = pushname || verifiedName
        const commands = caption || body || ''
        const command = commands.toLowerCase().split(' ')[0] || ''
        const args =  commands.split(' ')

        const msgs = (message) => {
            if (command.startsWith('#')) {
                if (message.length >= 10){
                    return `${message.substr(0, 15)}`
                }else{
                    return `${message}`
                }
            }
        }

        const mess = {
            wait: '⏳por favor aguarde, em processamento.',
            error: {
                St: '❗envie uma imagem com a legenda *#figurinha* ou responda à uma já enviada.\n\n⚠️ caso seja figurinha animada, use *#stickergif*.',
                Yt3: '❗ocorreu um erro! esse erro foi reportado =)',
                Ig: '❗ocorreu um erro! provavelmente é a API problemática novamente🤔 *(esse erro foi reportado automaticamente, estamos trabalhando para resolver, pedimos desculpas).*',
                Iv: '❗o link que você enviou é inválido!',
				Fb: '❗ocorreu um erro! *se a conta ou grupo é privado (a), não será possível efetuar o download!*\n\n*esse erro foi reportado.*',
				Ad: '❗ocorreu um erro! talvez o usuário apenas aceite ser adicionado através de convite.',
				Ki: '❗o bot não pode remover administradores do grupo!'
            }
        }
        const apiKey = 'Y9J5JPEP5BXrSd04gvf8' // https://mhankbarbar.herokuapp.com/api
        const vhtearkey = 'Tobz2k19' // https://api.vhtear.com
		//const apiSimi = JSON.parse(fs.readFileSync('./settings/api.json'))
		//const isSimi = simi.includes(chatId)
        const time = moment(t * 1000).format('DD/MM HH:mm:ss')
        const botNumber = await client.getHostNumber()
        const blockNumber = await client.getBlockedIds()
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const isGroupAdmins = isGroupMsg ? groupAdmins.includes(sender.id) : false
        const isBotGroupAdmins = isGroupMsg ? groupAdmins.includes(botNumber + '@c.us') : false
        const ownerNumber = ["554195642726@c.us","554195642726"] // replace with your whatsapp number
        const isOwner = ownerNumber.includes(sender.id)
        const isBlocked = blockNumber.includes(sender.id)
        const isNsfw = isGroupMsg ? nsfw_.includes(chat.id) : false
		const url = args.length !== 0 ? args[0] : ''
		const uaOverride = 'WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
        const isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi)
        if (!isGroupMsg && command.startsWith('#')) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(msgs(command)), 'from', color(pushname))
        if (isGroupMsg && command.startsWith('#')) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(msgs(command)), 'from', color(pushname), 'in', color(formattedTitle))
        //if (!isGroupMsg && !command.startsWith('!')) console.log('\x1b[1;33m~\x1b[1;37m>', '[\x1b[1;31mMSG\x1b[1;37m]', time, color(body), 'from', color(pushname))
        //if (isGroupMsg && !command.startsWith('!')) console.log('\x1b[1;33m~\x1b[1;37m>', '[\x1b[1;31mMSG\x1b[1;37m]', time, color(body), 'from', color(pushname), 'in', color(formattedTitle))
        if (isBlocked) return
        //if (!isOwner) return
        switch(command) {
        //figurinha
		case '#sticker':
        case '#stiker':
		case '#figurinha':
		case '#fig':
            if (isMedia && type === 'image') {
                const mediaData = await decryptMedia(message, uaOverride)
                const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                await client.sendImageAsSticker(from, imageBase64)
            } else if (quotedMsg && quotedMsg.type == 'image') {
                const mediaData = await decryptMedia(quotedMsg, uaOverride)
                const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                await client.sendImageAsSticker(from, imageBase64)
            } else if (args.length === 2) {
                const url = args[1]
                if (url.match(isUrl)) {
                    await client.sendStickerfromUrl(from, url, { method: 'get' })
                        .catch(err => console.log('ocorreu um erro: ', err))
                } else {
                    client.reply(from, mess.error.Iv, id)
                }
            } else {
                    client.reply(from, mess.error.St, id)
            }
            break
		//figurinhagif
        case '#stickergif':
		case '#gifsticker':
        case '#stikergif':
        case '#sgif':
		case '#gif':
		case '#figurinhagif':
		case '#figanimada':
		case '#figurinhaanimada':
		case '#animada':
            if (isMedia) {
                if (mimetype === 'video/mp4' && message.duration < 10 || mimetype === 'image/gif' && message.duration < 10) {
                    const mediaData = await decryptMedia(message, uaOverride)
                    client.reply(from, '⏳por favor aguarde, isso geralmente leva alguns segundos.\n\n*⚠️caso não funcione, diminua a duração do gif/vídeo* (não pode conter mais que 1MB, se não o WhatsApp não suporta).', id)
                    const filename = `./media/aswu.${mimetype.split('/')[1]}`
                    await fs.writeFileSync(filename, mediaData)
                    await exec(`gify ${filename} ./media/output.gif --fps=24 --scale=240:240`, async function (error, stdout, stderr) {
                        const gif = await fs.readFileSync('./media/output.gif', { encoding: "base64" })
                        await client.sendImageAsSticker(from, `data:image/gif;base64,${gif.toString('base64')}`)
						await client.sendText(from, 'aqui está! considere divulgar para um amigo, use *#compartilhar* =)\n*🐦Twitter:* @itsfks1', id)
                    })
                } else (
                    client.reply(from, '❗por favor, envie um vídeo/gif contendo no máximo 5 segundos!', id)
                )
            }
            break
		//figurinhatransparente
	    case '#stickernobg':
        case '#stikernobg':
		case '#figurinhasemfundo':
		case '#figurinhatransparente':
		case '#figsemfundo':
		case '#figtransparente':
		case '#transparente':
	    if (isMedia) {
                try {
                    var mediaData = await decryptMedia(message, uaOverride)
                    var imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                    var base64img = imageBase64
                    var outFile = './media/img/noBg.png'
                    // untuk api key kalian bisa dapatkan pada website remove.bg
                    var result = await removeBackgroundFromImageBase64({ base64img, apiKey: 'qMk1WP1kSUQJgukDZSGt7mnG', size: 'preview', type: 'auto', outFile })
                    await fs.writeFile(outFile, result.base64img)
                    await client.sendImageAsSticker(from, `data:${mimetype};base64,${result.base64img}`)
					await client.sendText(from, 'aqui está! considere divulgar para um amigo, use *#compartilhar* =)\n*🐦Twitter:* @itsfks1', id)
                } catch(err) {
                    console.log(err)
                }
            }
            break
		//fun
		case '#explodirwanted':
			client.reply(from, 'heheheheh, okkkkk, dia de maldade', id)
			break
		//converter figurinha em imagem
        case '#stickertoimg':
		case '#figurinhaemimagem':
		case '#figurinhapraimagem':
		case '#figtoimage':
		case '#stikertoimg':
		case '#sticker2img':
		case '#stiker2img':
		case '#fig2img':
		case '#figimg':
		case '#figurinhaparaimagem':
		case '#figpimg':
		case '#figurinhapimg':
		case '#figpraimagem':
		case '#converterfigurinha':
            if (quotedMsg && quotedMsg.type == 'sticker') {
                const mediaData = await decryptMedia(quotedMsg)
                client.reply(from, '⏳por favor aguarde, em processamento.', id)
                const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                await client.sendFile(from, imageBase64, 'imagesticker.jpg', 'aqui está! considere divulgar para um amigo, use *#compartilhar* =)\n*🐦Twitter:* @itsfks1', id)
            } else if (!quotedMsg) return client.reply(from, 'por favor, responda à figurinha que você deseja transformar em imagem com esse comando!', id)
            break
		//comprimentos
		case 'oi':
		case '#help':
		case '#ajuda':
		case '#menu':
		case 'hi':
		case 'oie':
		case 'oiee':
		case 'oieee':
		case 'oii':
		case 'olá':
		case 'roi':
		case 'salve':
		case 'bom dia':
		case 'boa tarde':
		case 'bdia':
		case 'btarde':
		case 'oiiii':
		case 'eae':
		case 'eai':
		case 'iae':
		case 'iai':
            client.reply(from, help, id)
            break
		//agradecimento
		case 'obrigado':
		case 'valeu':
		case 'obgd':
		case 'obrigada':
		case 'vlw':
		case 'obggg':
		case 'muito obrigado':
		case 'muito obrigada':
		case 'obgda':
		case 'thanks':
		case 'thx':
		case 'valeuu':
		case 'noix':
		case 'valeuuuu':
		case 'obrigadoo':
		case 'bigadu':
		case 'bigada':
		case 'valeuuu':
		case 'obgg':
		case 'obgdaa':
		case 'obg':
		case 'obrigadaa':
			client.sendStickerfromUrl(from, `https://i.imgur.com/BCnUdSQ.jpg`, { method: 'get' })
				.catch(err => console.log('ocorreu um erro: ', err))
			break
		//despedida
		case 'tchau':
		case 'xau':
		case 'flw':
		case 'adeus':
		case 'adiós':
		case 'tchauuu':
		case 'bye':
		case 'até mais':
		case 'bye':
		case 'tchauu':
		case 'flww':
			client.reply(from, 'até mais =)')
			break
		//termos
		case '#termos':
            client.reply(from, snk, id)
            break
		//reportarbug - developing
		case '#report':
			client.reply(from, 'agradecemos a sua mensagem!')
			break
		//corona
        case '#covid':
		case '#corona':
		case '#covid-19':
            const response2 = await axios.get('https://coronavirus-19-api.herokuapp.com/countries/Brazil/')
            const { cases, todayCases, deaths, todayDeaths, active } = response2.data
                await client.reply(from, '*informações da covid-19 no 🇧🇷*' + '\n\n✨️total de casos: ' + `${cases}` + '\n📆️casos hoje: ' + `${todayCases}` + '\n☣️mortes: ' + `${deaths}` + '\n☢️mortes hoje: ' + `${todayDeaths}` + '\n⛩️casos confirmados: ' + `${active}` + '\n\n📈 dados fornecidos por: worldometers.info')
            break
		//novos recursos
		case '#spotify':
		case '#emojisticker':
		case '#shazam':
			client.reply(from, 'oie, essa função ainda está em desenvolvimento e será liberada em breve =)', id)
			break
		// funny
		case 'lixo':
		case 'fdp':
		case 'corno':
		case 'inutil':
			client.reply(from, 'vc', id)
			break
		case 'vtnc':
			client.reply(from, 'vai tu', id)
			break
		//comandosadmin
		case '#getip':
		    if (!isOwner) return client.reply(from, 'esse comando só pode ser utilizado pelo administrador!', id)
			client.reply(from, '*IPV4:* 68.183.100.204\n*IPV6:* 2604:a880:400:d0::1add:c001\n\n*provedor:* DigitalOcean, LLC\n*localização:* 🇺🇸North Bergen, New Jersey, United States')
			break
		case '#menuadmin':
		    if (!isOwner) return client.reply(from, 'esse comando só pode ser utilizado pelo administrador!', id)
			client.reply(from, '*1. #broadcast <texto>*: envia uma mensagem para todos os utilizadores.\n\n*2. #bloqueados*: lista os usuários bloqueados\n\n*3. #getsession*: mostra informações sobre a sessão conectada do WhatsApp.\n\n*4. #getip*: obtém o IPV4 e IPV6 do servidor.\n\n*5. #status*: mostra as estatísticas do bot.\n\n*6. #save*: salva um arquivo no servidor.\n\n*7. #ping*: mostra a velocidade do bot e o uso de RAM.\n\n*8. #desligar*: desliga o bot.')
			break
        case '#status':
		    if (!isOwner) return client.reply(from, 'esse comando só pode ser utilizado pelo administrador!', id)
            const loadedMsg = await client.getAmountOfLoadedMessages()
            const chatIds = await client.getAllChatIds()
            const groups = await client.getAllGroups()
            client.sendText(from, `*estatísticas:*\n- *${loadedMsg}* mensagens processadas\n- *${groups.length}* grupos\n- *${chatIds.length - groups.length}* utilizadores\n- *${chatIds.length}* total`)
            break
        case '#broadcast':
            if (!isOwner) return client.reply(from, 'esse comando só pode ser usado pelo administrador!', id)
            let msg = body.slice(4)
            const chatz = await client.getAllChatIds()
            for (let ids of chatz) {
                var cvk = await client.getChatById(ids)
                if (!cvk.isReadOnly) await client.sendText(ids, `${msg}`)
            }
            client.reply(from, 'envio com sucesso!', id)
            break
        case '#getsession':
			if (!isOwner) return client.reply(from, 'esse comando só pode ser usado pelo administrador!', id)
            const sesPic = await client.getSnapshot()
            client.sendFile(from, sesPic, 'session.png', 'dados da sessão.', id)
            break
        case '#bloqueados':
            if (!isOwner) return client.reply(from, 'esse comando só pode ser usado pelo administrador!', id)
            let hih = `lista de números bloqueados:\ntotal: ${blockNumber.length}\n`
            for (let i of blockNumber) {
                hih += `- @${i.replace(/@c.us/g,'')}\n`
            }
            client.sendTextWithMentions(from, hih, id)
            break
		case '#save':
            if (!isOwner) return client.reply(from, 'esse comando só pode ser usado pelo administrador!', id)
			if (mimetype) {
			  const filename = `${t}.${mime.extension(mimetype)}`
			  const mediaData = await decryptMedia(message);
			  const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
			  fs.writeFile(filename, mediaData, function(err) {
				if (err) {
				  return console.log(err)
				}
				client.reply(from, 'o arquivo foi salvo no servidor!');
			  })
			}
			break
        case '#ping':
		case 'ping':
            const timestamp = speed();
            const latensi = speed() - timestamp
            client.sendText(from, `pong!!!\n\n*Uso de RAM:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB\n*Velocidade:* ${latensi.toFixed(4)} _segundo(s)_`)
            break
		case '#shutdown':
		case '#desligar':
            if (!isOwner) return client.reply(from, 'esse comando só pode ser usado pelo administrador!', id)
			await client.sendText(from, 'ok! confira no terminal do servidor.')
			await client.reply(from, 'desligando...', id)
			await client.sendTextWithMentions(from, `comando executado com sucesso @${sender.id}!`).then(async() => await client.kill())
		//qrcode
        case '#qrcode':
           if (args.length === 1)  return client.reply(from, '❗você precisa inserir algum texto ou link para formar um QR dele!', id)
           let qrcodes = body.slice(8)
           await client.sendFileFromUrl(from, `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${qrcodes}`, 'gambar.png', 'aqui está! considere divulgar para um amigo, use *#compartilhar* =)\n*🐦Twitter:* @itsfks1')
           break
		//google
        case '#google':
		case '#pesquisar':
		case '#search':
            client.reply(from, mess.wait, id)
            const googleQuery = body.slice(8)
            if(googleQuery == undefined || googleQuery == ' ') return client.reply(from, `*Resultados da pesquisa: ${googleQuery}* ⚠️não encontrado.`, id)
            google({ 'query': googleQuery }).then(results => {
            let vars = `*Resultados da pesquisa:* _${googleQuery}_\n`
            for (let i = 0; i < results.length; i++) {
                vars +=  `\n═════════════════\n\n*Título:* ${results[i].title}\n\n*Descrição:* ${results[i].snippet}\n\n*Link:* ${results[i].link}\n\n`
            }
                client.reply(from, vars, id);
            }).catch(e => {
                console.log(e)
                client.sendText(ownerNumber, 'ocorreu um erro: ' + e);
            })
            break
		//stalkearIG
        case '#igstalk':
		case '#stalkig':
		case '#instastalk':
		case '#stalkinsta':
            if (args.length === 1)  return client.reply(from, '❗você precisa inserir o @ de um usuário do Instagram!', id)
            const stalk = await get.get(`https://mhankbarbar.herokuapp.com/api/stalk?username=${args[1]}&apiKey=${apiKey}`).json()
            if (stalk.error) return client.reply(from, stalk.error, id)
            const { Biodata, Jumlah_Followers, Jumlah_Following, Jumlah_Post, Name, Username, Profile_pic } = stalk
            const caps = `*Nome:* ${Name}\n*Usuário:* ${Username}\n*Seguidores:* ${Jumlah_Followers}\n*Seguindo:* ${Jumlah_Following}\n*Publicações:* ${Jumlah_Post}\n*Bio:* ${Biodata}`
            await client.sendFileFromUrl(from, Profile_pic, 'Profile.jpg', caps, id)
            client.sendText(from, 'aqui está! considere divulgar para um amigo, use *#compartilhar* =)\n*🐦Twitter:* @itsfks1', id)
			break
		//stalkearTT
		case '#twitterstalk':
		case '#ttstalk':
		case '#stalktt':
		case '#twtstalk':
		case '#stalktwt':
		case '#twtstalker':
            if (args.length === 1)  return client.reply(from, '❗você precisa inserir o @ de um usuário do Twitter!', id)
            const twstalk = await get.get(`https://mhankbarbar.herokuapp.com/api/twstalk?username=${args[1]}&apiKey=${apiKey}`).json()
            if (twstalk.error) return client.reply(from, twstalk.error, id)
            const { followers_count, full_name, profile_pic, status_count } = twstalk
            const caps2 = `*Nome:* ${full_name}\n*Seguidores:* ${followers_count}\n*Tweets:* ${status_count}`
            await client.sendFileFromUrl(from, profile_pic, 'Profile.jpg', caps2, id)
            client.sendText(from, 'aqui está! considere divulgar para um amigo, use *#compartilhar* =)\n*🐦Twitter:* @itsfks1', id)
			break
		//divulgar bot
        case '#compartilhar':
		case '#divulgar':
		case 'compartilhar':
		case 'divulgar':
            client.sendContact(from, '554135421229@c.us')
            break
		//downloaderFB
        case '#fb':
		case '#facebook':
		case 'facebook':
		case 'fb':
            if (args.length === 1) return client.reply(from, '❗você precisa inserir o link de um vídeo do Facebook! verifique o *#menu* para mais informações.', id)
            if (!args[1].includes('facebook.com')) return client.reply(from, mess.error.Iv, id)
            client.reply(from, mess.wait, id)
            const epbe = await get.get(`https://mhankbarbar.herokuapp.com/api/epbe?url=${args[1]}&apiKey=${apiKey}`).json()
            if (epbe.error) return client.reply(from, mess.error.Fb, id)
            await client.sendFileFromUrl(from, epbe.result, 'epbe.mp4', epbe.title, id)
			await client.sendText(from, 'aqui está! considere divulgar para um amigo, use *#compartilhar* =)\n*🐦Twitter:* @itsfks1', id)
            break
		//downloaderTT
        case '#twt':
		case '#tt':
		case '#twitter':
            if (args.length === 1) return client.reply(from, '❗você precisa inserir o link de um vídeo do Twitter! verifique o *#menu* para mais informações.', id)
            if (!args[1].includes('twitter.com')) return client.reply(from, mess.error.Iv, id)
            client.reply(from, mess.wait, id)
            const twit = await get.get(`https://mhankbarbar.herokuapp.com/api/twit?url=${args[1]}&apiKey=${apiKey}`).json()
            if (twit.error) return client.reply(from, twit.error, id)
            await client.sendFileFromUrl(from, twit.result, 'twit.mp4', twit.title, id)
			await client.sendText(from, 'aqui está! considere divulgar para um amigo, use *#compartilhar* =)\n*🐦Twitter:* @itsfks1', id)
            break
		//downloaderIG
        case '#ig':
		case '#instagram':
            if (args.length === 1) return client.reply(from, '❗você precisa inserir o link de um vídeo do Instagram! verifique o *#menu* para mais informações.')
            if (!args[1].match(isUrl) && !args[1].includes('instagram.com')) return client.reply(from, mess.error.Iv, id)
            try {
                client.reply(from, mess.wait, id)
                const resp = await get.get(`https://mhankbarbar.herokuapp.com/api/ig?url=${args[1]}&apiKey=${apiKey}`).json()
                if (resp.result.includes('.mp4')) {
                    var ext = '.mp4'
                } else {
                    var ext = '.jpg'
                }
                await client.sendFileFromUrl(from, resp.result, `igeh${ext}`, '', id)
				await client.sendText(from, 'aqui está! considere divulgar para um amigo, use *#compartilhar* =)\n*🐦Twitter:* @itsfks1', id)
            } catch {
                client.reply(from, mess.error.Ig, id)
                }
            break
		//downloaderYTMP3
		case '#play':
		case '#ytmp3':
		case '#musica':
		case '#ytmusic':
		case '#music':
		case '#música':
		case '#msk':
		case 'música':
		case 'musica':
		case 'mega':
		case '#mega':
		case 'music':
				if (args.length == 1) return client.reply(from, `*❗envie também o nome de uma música ou o link da mesma!*`, id)
				axios.get(`https://arugaytdl.herokuapp.com/search?q=${body.slice(6)}`)
				.then(async (res) => {
					await client.sendFileFromUrl(from, `${res.data[0].thumbnail}`, ``, `*música encontrada:*\n\n*Título:* ${res.data[0].title}\n*Duração:* ${res.data[0].duration} segundos\n*Postado:* ${res.data[0].uploadDate}\n*Visualizações:* ${res.data[0].viewCount}\n\n*⚠️por favor aguarde, esse processo pode levar alguns minutos!*\n\n*⚠️limite máximo de 32MB por música!*`, id)
					axios.get(`https://arugaz.herokuapp.com/api/yta?url=${res.data[0].id}`)
					.then(async(rest) => {
						if (Number(rest.data.filesize.split(' MB')[0]) >= 32.00) return client.reply(from, 'o tamanho da música é muito grande! *tamanho máximo permitido: 32MB.*')
						await client.sendFileFromUrl(from, `${rest.data.result}`, id)
						await client.sendText(from, 'aqui está! considere divulgar para um amigo, use *#compartilhar* =)\n*🐦Twitter:* @itsfks1', id)
					})
					.catch(() => {
						client.reply(from, 'ocorreu algum erro! *esse erro foi reportado.*', id)
					})
				})
				.catch(() => {
					client.reply(from, 'ocorreu algum erro! *esse erro foi reportado.*', id)
				})
				break
		//tst
		case '#testeyt':
				if (args.length == 1) return client.reply(from, `*❗envie também o nome de uma música!*`, id)
				axios.get(`https://arugaytdl.herokuapp.com/search?q=${body.slice(6)}`)
			const options = {
			  method: 'GET',
			  url: 'https://youtube-to-mp32.p.rapidapi.com/yt_to_mp3',
			  params: {video_id: '${res.data[0].id}'},
			  headers: {
				'x-rapidapi-key': '98730bfe70msh592e6b4d06949acp1ee2cajsnc24fe4c60703',
				'x-rapidapi-host': 'youtube-to-mp32.p.rapidapi.com'
			  }
			};

			axios.request(options).then(function (response) {
				console.log(response.data);
			}).catch(function (error) {
				console.error(error);
			});
			break
		//clima
		case '#clima':
				if (args.length == 1) return client.reply(from, `*❗envie também o nome da cidade!*`, id)
				//const clima = await get.get(`https://api.hgbrasil.com/weather?key=e7de87a0&city_name=${body.slice(6)}&fields=only_results,temp,city_name,forecast,max,min,date,sunrise,sunset,description`).json()
				const clima = await get.get(`https://api.hgbrasil.com/weather?key=e7de87a0&city_name=${body.slice(6)}&fields=only_results,temp,city_name,forecast,max,min,date,sunrise,sunset,description,currently,wind_speedy,condition_slug,time`).json()
				const { temp, date, time, city_name, max, min, sunrise, sunset, description, currently, wind_speedy, condition_slug } = clima
				const clima2 = `🏙*cidade:* ${city_name}\n\n🌡*temperatura atual:* ${temp}º\nℹ️ *informações:* ${description}, está de ${currently}.\n🌄 *nascer do sol:* ${sunrise}.\n🌅 *pôr do sol:* ${sunset}.\n💨*velocidade dos ventos:* ${wind_speedy}.\n🗓*data:* ${date}, ${time}.\n\n📈 dados fornecidos por: hgbrasil.com`
				await client.reply(from, clima2, id)
				break
		//comandos não finalizados / developing / desativados
		case '#reserva':
            if (!isOwner) return client.reply(from, 'esse comando só pode ser usado pelo administrador!', id)
            if (args.length === 1) return client.reply(from, '❗envie também o link da música!')
            let isLinks = args[1].match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)
            if (!isLinks) return client.reply(from, mess.error.Iv, id)
            try {
                client.reply(from, mess.wait, id)
                const resp = await get.get(`https://mhankbarbar.herokuapp.com/api/yta?url=${args[1]}&apiKey=${apiKey}`).json()
                if (resp.error) {
                    client.reply(from, resp.error, id)
                } else {
                    const { title, thumb, filesize, result } = await resp
                    if (Number(filesize.split(' MB')[0]) >= 60.00) return client.reply(from, 'desculpe, a música excedeu o tamanho máximo de 50 MB!', id)
                    client.sendFileFromUrl(from, thumb, 'thumb.jpg', `*música encontrada:*\n\n*Título*: ${title}\n*Tamanho*: ${filesize}\n\n*⚠️por favor aguarde, esse processo pode levar alguns minutos!*\n\n*⚠️caso a música ultrapasse o limite de 60MB, a mesma não será enviada!*\n\n*❗essa função está em desenvolvimento e pode ocorrer alguns bugs!*\n\n*❗o bug que não permitia o envio de música com copyright aparentemente foi resolvido.*`, id)
                    await client.sendFileFromUrl(from, result, `${title}.mp3`, '', id).catch(() => client.reply(from, mess.error.Yt3, id))
                    //await client.sendAudio(from, result, id)
                }
            } catch (err) {
                client.sendText(ownerNumber[0], 'ocorreu um erro: '+ err)
                client.reply(from, mess.error.Yt3, id)
            }
            break
		case '#testeytb':
            if (args.length == 0) return client.reply(from, `Untuk mendownload lagu dari youtube\nketik: ${prefix}ytmp3 [link_yt]`, id)
            const linkmp3 = args[0].replace('https://youtu.be/','').replace('https://www.youtube.com/watch?v=','')
			rugaapi.ytmp3(`https://youtu.be/${linkmp3}`)
            .then(async(res) => {
				if (res.status == 'error') return client.sendFileFromUrl(from, `${res.link}`, '', `${res.error}`)
				await client.sendFileFromUrl(from, `${res.thumb}`, '', `Lagu ditemukan\n\nJudul ${res.title}\n\nSabar lagi dikirim`, id)
				await client.sendFileFromUrl(from, `${res.link}`, '', '', id)
				.catch(() => {
					client.reply(from, `URL INI ${args[0]} SUDAH PERNAH DI DOWNLOAD SEBELUMNYA ..URL AKAN RESET SETELAH 60 MENIT`, id)
				})
			})
            break
		//comandos grupo
        case '#linkgroup':
		case '#link':
		case '#linkgrupo':
            if (!isBotGroupAdmins) return client.reply(from, 'para usar esse comando, o bot precisa ser um administrador :/', id)
            if (isGroupMsg) {
                const inviteLink = await client.getGroupInviteLink(groupId);
                client.sendLinkWithAutoPreview(from, inviteLink, `\nlink do grupo *${name}*`)
            } else {
            	client.reply(from, 'esse comando só pode ser usado em grupos!', id)
            }
            break
        case '#admlist':
		case '#adminlist':
		case '#listadm':
		case '#admins':
		case '#adms':
            if (!isGroupMsg) return client.reply(from, 'esse comando só pode ser usado em grupos!', id)
            let mimin = ''
            for (let admon of groupAdmins) {
                mimin += `🥶 @${admon.replace(/@c.us/g, '')}\n` 
            }
            await client.sendTextWithMentions(from, mimin)
            break
        case '#criadorgrupo':
            if (!isGroupMsg) return client.reply(from, 'esse comando só pode ser usado em grupos!', id)
            const Owner_ = chat.groupMetadata.owner
            await client.sendTextWithMentions(from, `🥵criador: @${Owner_}`)
            break
        case '#removertodos':
		case '#kickall':
            if (!isGroupMsg) return client.reply(from, 'esse comando só pode ser usado em grupos!', id)
            const isGroupOwner = sender.id === chat.groupMetadata.owner
            if (!isGroupOwner) return client.reply(from, '⚠️esse comando só pode ser usado pelos adms!', id)
            if (!isBotGroupAdmins) return client.reply(from, 'esse comando só pode ser usado se o bot for um administrador!', id)
            const allMem = await client.getGroupMembers(groupId)
            for (let i = 0; i < allMem.length; i++) {
                if (groupAdmins.includes(allMem[i].id)) {
                    console.log('Upss this is Admin group')
                } else {
                    await client.removeParticipant(groupId, allMem[i].id)
                }
            }
            client.reply(from, 'todos os membros removidos com sucesso!', id)
            break
        case '#add':
		case '#adicionar':
            const orang = args[1]
            if (!isGroupMsg) return client.reply(from, 'esse comando só pode ser usado em grupos!', id)
            if (args.length === 1) return client.reply(from, 'para adicionar alguém, envie *#add e o número da pessoa* (com o 55)\n*exemplo: #add 554199999999*.', id)
            if (!isGroupAdmins) return client.reply(from, 'esse comando só pode ser usado pelos adms!', id)
            if (!isBotGroupAdmins) return client.reply(from, 'esse comando só pode ser usado se o bot for um administrador!', id)
            try {
                await client.addParticipant(from,`${orang}@c.us`)
            } catch {
                client.reply(from, mess.error.Ad, id)
            }
            break
        case '#kick':
		case '#ban':
		case '#remover':
            if (!isGroupMsg) return client.reply(from, 'esse comando só pode ser usado em grupos!', id)
            if (!isGroupAdmins) return client.reply(from, 'esse comando só pode ser usado pelos adms!', id)
            if (!isBotGroupAdmins) return client.reply(from, 'esse comando só pode ser usado se o bot for um administrador!', id)
            if (mentionedJidList.length === 0) return client.reply(from, 'para remover alguém, use *#ban* @ (mencione a pessoa).', id)
            await client.sendText(from, `ok, o usuário será removido:\n${mentionedJidList.join('\n')}`)
            for (let i = 0; i < mentionedJidList.length; i++) {
                if (groupAdmins.includes(mentionedJidList[i])) return client.reply(from, mess.error.Ki, id)
                await client.removeParticipant(groupId, mentionedJidList[i])
            }
            break
        case '#promote':
		case '#promover':
		case '#tornaradm':
            if (!isGroupMsg) return client.reply(from, 'esse comando só pode ser usados em grupos!', id)
            if (!isGroupAdmins) return client.reply(from, 'esse comando só pode ser usado pelos adms!', id)
            if (!isBotGroupAdmins) return client.reply(from, 'esse comando só pode ser usado se o bot for um administrador!', id)
            if (mentionedJidList.length === 0) return client.reply(from, 'para promever um membro à administrador, use *#promote @* (mencione a pessoa).', id)
            if (mentionedJidList.length >= 2) return client.reply(from, 'esse comando só pode ser usado em um único usuário por vez.', id)
            if (groupAdmins.includes(mentionedJidList[0])) return client.reply(from, '⚠️o usuário já é um administrador!', id)
            await client.promoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `ok, @${mentionedJidList[0]} agora é um administrador!`)
            break
        case '#demote':
		case '#rebaixar':
		case '#tiraradm':
            if (!isGroupMsg) return client.reply(from, 'esse comando só pode ser usado em grupos!', id)
            if (!isGroupAdmins) return client.reply(from, 'esse comando só pode ser usado pelos adms!', id)
            if (!isBotGroupAdmins) return client.reply(from, 'esse comando só pode ser usado se o bot for um administrador!', id)
            if (mentionedJidList.length === 0) return client.reply(from, 'para remover a permissão de administrador de um usuário, use *#rebaixar @* (mencione a pessoa).', id)
            if (mentionedJidList.length >= 2) return client.reply(from, 'esse comando só pode ser usado em um único usuário por vez.', id)
            if (!groupAdmins.includes(mentionedJidList[0])) return client.reply(from, '⚠️o usuário não é um administrador!', id)
            await client.demoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `ok, @${mentionedJidList[0]} não é mais um administrador!`)
            break
        case '#join':
		case '#entrar':
            //return client.reply(from, 'Jika ingin meng-invite bot ke group anda, silahkan izin ke wa.me/6285892766102', id)
            if (args.length < 2) return client.reply(from, '*❗insira também o link do grupo que deseja inserir!* (certifique-se de quem autorização do criador, não me responsabilizo por nada)\n*exemplo:* #join https://chat.whatsapp.com/blablablablablabla', id)
            const link = args[1]
            //const key = args[2]
            const tGr = await client.getAllGroups()
            const minMem = 5
            const isLink = link.match(/(https:\/\/chat.whatsapp.com)/gi)
            //if (key !== 'lGjYt4zA5SQlTDx9z9Ca') return client.reply(from, '*key* salah! silahkan chat owner bot unruk mendapatkan key yang valid', id)
            const check = await client.inviteInfo(link)
            if (!isLink) return client.reply(from, 'isso é um link?🤔', id)
            if (tGr.length > 500) return client.reply(from, 'o limite de grupos foi atingido! logo abrirão mais vagas =)', id)
            if (check.size < minMem) return client.reply(from, 'o grupo precisa conter no mínimo 5 participantes para evitar spam.', id)
            if (check.status === 200) {
                await client.joinGroupViaLink(link).then(() => client.reply(from, 'o bot será adicionado em breve! 🤩'))
            } else {
                client.reply(from, 'link de grupo inválido!', id)
            }
            break
        case '#delete':
		case '#apagar':
		case '#del':
            if (!isGroupMsg) return client.reply(from, 'esse comando só pode ser usado em grupos!', id)
            if (!isGroupAdmins) return client.reply(from, 'esse comando só pode ser usado pelos adms!', id)
            if (!quotedMsg) return client.reply(from, '❗responda à mensagem que deseja apagar com *#delete*.', id)
            if (!quotedMsgObj.fromMe) return client.reply(from, '❗não posso deletar mensagens de outros usuários :/', id)
            client.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
            break
		//teste
		//simi
		/*case '#simisimi':
			if (!isGroupMsg) return client.reply(from, 'esse comando só pode ser usado em grupos!', id)
			client.reply(from, `para habilitar a função simisimi, use #simi on`, id)
			break
		case '#simi':
			if (!isGroupMsg) return client.reply(from, 'esse comando só pode ser usado em grupos!', id)
            if (!isGroupAdmins) return client.reply(from, 'esse comando só pode ser usado pelos adms.', id)
			if (args.length !== 1) return client.reply(from, `para habilitar a função simisimi, use #simi on`, id)
			if (args[0] == 'on') {
				simi.push(chatId)
				fs.writeFileSync('./settings/simi.json', JSON.stringify(simi))
                client.reply(from, 'ativando o bot simsimi!', id)
			} else if (args[0] == 'off') {
				let inxx = simi.indexOf(chatId)
				simi.splice(inxx, 1)
				fs.writeFileSync('./settings/simi.json', JSON.stringify(simi))
				client.reply(from, 'Menonaktifkan bot simi-simi!', id)
			} else {
				client.reply(from, `Untuk mengaktifkan simi-simi pada Group Chat\n\nPenggunaan\n${prefix}simi on --mengaktifkan\n${prefix}simi off --nonaktifkan\n`, id)
			}
			break
		//premium
		*/
		case '#premium':
			client.sendText(from, 'por enquanto não há certeza se realmente ativarei isso. em breve mais informações. por ora os recursos premium continuam desativados aos utilizadores em geral.', id)
			break
		case '#playcorrigir':
				if (!isOwner) return client.reply(from, 'esse comando só pode ser usado pelo administrador!', id)
				if (args.length == 1) return client.reply(from, `❗envie também o nome de uma música ou o link da mesma!`, id)
				axios.get(`https://arugaytdl.herokuapp.com/search?q=${body.slice(6)}`)
				.then(async (res) => {
					await client.sendFileFromUrl(from, `${res.data[0].thumbnail}`, ``, `*música encontrada:*\n\n*Título:* ${res.data[0].title}\n*Duração:* ${res.data[0].duration} segundos\n*Postado:* ${res.data[0].uploadDate}\n*Visualizações:* ${res.data[0].viewCount}\n\n*⚠️por favor aguarde, esse processo pode levar alguns minutos! (isso depende da velocidade disponível nos servidores da Y2mate).*\n\n*⚠️caso a música ultrapasse o limite de 32MB, a mesma não será enviada!*\n\n*❗essa função está em desenvolvimento e pode ocorrer alguns bugs!*\n\n*❗o bug que não permitia o envio de música com copyright aparentemente foi resolvido.*`, id)
					axios.get(`https://arugaz.herokuapp.com/api/yta?url=https://youtu.be/${res.data[0].id}`)
					.then(async(rest) => {
						if (Number(rest.data.filesize.split(' MB')[0]) >= 32.00) return aruga.reply(from, 'o tamanho da música é muito grande!')
						await client.sendFile(from, `${rest.data.result}`, id)
						await client.sendText(from, 'aqui está! considere me divulgar para um amigo =)\n\nuse *#compartilhar*.\n\n*🐦Twitter:* @itsfks1', id)
					})
					.catch(() => {
						client.reply(from, 'ocorreu algum erro! *verifique se a música respeita o tamanho máximo de 32 MB!*', id)
					})
				})
				.catch(() => {
					client.reply(from, 'ocorreu algum erro! *verifique se a música respeita o tamanho máximo de 32 MB!*', id)
				})
				break
        }
    } catch (err) {
        console.log(color('[ERRO]', 'red'), err)
        //client.kill().then(a => console.log(a))
    }
}
