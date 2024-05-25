const { ChatOpenAI } = require('@langchain/openai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const {
  createStuffDocumentsChain,
} = require('langchain/chains/combine_documents');
const dotenv = require('dotenv');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { createRetrievalChain } = require('langchain/chains/retrieval');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const { Document } = require('@langchain/core/documents');
const {
  WeatherUpdateSchema,
  OperationTypeSchema,
} = require('../../schemas/weatherSchemas');
const Instructor = require('@instructor-ai/instructor');
const OpenAI = require('openai');
const db = require('../../db');
const z = require('zod');
dotenv.config();

const model = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo',
  temperature: 0.9,
});

const oai = new OpenAI();

const client = Instructor.default({
  client: oai,
  mode: 'MD_JSON',
});

function createDocument(doc) {
  return new Document({
    metadata: doc.id,
    pageContent: `In ${doc.id}, the current condition is ${doc.data().condition}, with a high of ${doc.data().high} and a low of ${doc.data().low}. The current temperature is ${doc.data().temperature}.`,
  });
}

async function processWeatherQuery(query) {
  try {
    const prompt = ChatPromptTemplate.fromTemplate(
      `Answer the user's question from the following context: {context} Question: {input}`,
    );

    const chain = await createStuffDocumentsChain({
      llm: model,
      prompt,
    });

    const dbDocs = await db.collection('weather').get();
    const documents = dbDocs.docs.map(createDocument);

    const embeddings = new OpenAIEmbeddings();

    const vectorStore = await MemoryVectorStore.fromDocuments(
      documents,
      embeddings,
    );
    const retriever = vectorStore.asRetriever({ k: 1 });

    const retrievalChain = await createRetrievalChain({
      combineDocsChain: chain,
      retriever,
    });

    const response = await retrievalChain.invoke({ input: query });

    return { data: response, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function determineOperationType(query) {
  try {
    const output = await client.chat.completions.create({
      temperature: 1,
      messages: [
        {
          role: 'system',
          content: `
            Analyze the following command and determine the operation type (update/add, delete):
            ${query}
            Return the operation type as a JSON object with a single field "operationType" which can be "update/add" or "delete".
          `,
        },
      ],
      model: 'gpt-3.5-turbo',
      response_model: {
        schema: OperationTypeSchema,
        name: 'Operation Type',
      },
    });

    const validationResult = OperationTypeSchema.safeParse({
      operationType: output.operationType,
    });

    console.log(validationResult);

    if (!validationResult.success) {
      throw new Error(
        'Validation failed: Incorrect format for operation type.',
      );
    }
    return validationResult.data.operationType;
  } catch (error) {
    console.error('Error determining operation type:', error);
    throw new Error(error.message || 'Failed to determine operation type.');
  }
}

async function handleWeatherDataOperation(query) {
  try {
    const operationType = await determineOperationType(query);
    console.log(operationType);

    switch (operationType) {
      case 'update/add':
        return await updateCityWeatherData(query);
      case 'delete':
        return await deleteCityWeatherData(query);
      default:
        return { data: null, error: 'Unknown operation type.' };
    }
  } catch (error) {
    console.error('Error handling weather data operation:', error);
    return {
      data: null,
      error: error.message || 'Failed to process the operation.',
    };
  }
}

async function deleteCityWeatherData(query) {
  try {
    const output = await client.chat.completions.create({
      temperature: 1,
      messages: [
        {
          role: 'system',
          content: `
              Analyze the following command to delete the weather data for a particular city:
              ${query}
              Context: city must start with a capital letter and should be a valid city. If the name of the city does not exist or the query is invalid then empty quotes for all fields.
              Return the city name to be deleted in the specified JSON format.
            `,
        },
      ],
      model: 'gpt-3.5-turbo',
      response_model: {
        schema: z.object({ city: z.string() }),
        name: 'Weather',
      },
    });

    const validationResult = z.object({ city: z.string() }).safeParse(output);

    if (!validationResult.success) {
      return {
        data: null,
        error: 'Validation failed: Incorrect format for city name.',
      };
    }

    const { city } = validationResult.data;
    const cityRef = db.collection('weather').doc(city);

    await cityRef.delete();

    return { data: { city }, error: null };
  } catch (error) {
    console.error('Error deleting city weather data:', error);
    return {
      data: null,
      error: error.message || 'Failed to delete city weather data.',
    };
  }
}

async function updateCityWeatherData(query) {
  try {
    const output = await client.chat.completions.create({
      temperature: 1,
      messages: [
        {
          role: 'system',
          content: `
                Analyze the following command to update the weather in a particular city:
                ${query}
                Context: city must start with a capital letter and should be a valid city. If the name of the city does not exist or the query is invalid then empty quotes for all fields
                         high, low, and temperature must be in Celsius and formatted like 20°C
                Return the weather update analysis in the specified JSON format.
                `,
        },
      ],
      model: 'gpt-3.5-turbo',
      response_model: {
        schema: WeatherUpdateSchema,
        name: 'Weather',
      },
    });

    const validationResult = WeatherUpdateSchema.safeParse(output);

    if (!validationResult.success) {
      return {
        data: null,
        error: 'Validation failed: Incorrect format for weather update data.',
      };
    }

    const weatherData = validationResult.data;
    const cityRef = db.collection('weather').doc(weatherData.city);

    const updateData = Object.fromEntries(
      Object.entries(weatherData).filter(([, value]) => value),
    );

    await cityRef.set(updateData, { merge: true });

    return { data: validationResult.data, error: null };
  } catch (error) {
    console.error('Error processing update command:', error);
    return {
      data: null,
      error: error.message || 'Failed to process the update command.',
    };
  }
}

module.exports = { processWeatherQuery, handleWeatherDataOperation };
