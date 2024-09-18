const { OpenAI } = require('openai');
const settings = require('../settings.json');

const openai = new OpenAI({
  apiKey: settings.chatbot.apiKey,
});

const generateChatbotResponse = async (messageContent, utils) => {
  try {
    const response = await openai.chat.completions.create({
      model: settings.chatbot.model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant named Nala.' },
        { role: 'user', content: messageContent },
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    utils.error(`Error generating chatbot response: ${error.message}`);
    return 'Sorry, I am having trouble thinking right now.';
  }
};

module.exports = async (message, utils) => {
  if (!settings.chatbot.enabled || message.author.bot) return;

  try {
    const cleanedMessage = message.content.trim();
    const response = await generateChatbotResponse(cleanedMessage, utils);
    await message.channel.send(response);
  } catch (error) {
    utils.error(error);
  }
};