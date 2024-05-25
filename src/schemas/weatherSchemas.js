const z = require('zod');

const WeatherUpdateSchema = z.object({
  city: z
    .string()
    .describe(
      'The name of the city for which the weather data is being updated.',
    ),
  high: z
    .string()
    .optional()
    .describe(
      'The highest temperature expected for the city, optional update.',
    ),
  low: z
    .string()
    .optional()
    .describe('The lowest temperature expected for the city, optional update.'),
  temperature: z
    .string()
    .optional()
    .describe(
      'The current or general temperature for the city, optional update.',
    ),
  condition: z
    .string()
    .optional()
    .describe(
      'The weather condition (e.g., sunny, rainy, cloudy) for the city, optional update.',
    ),
});

const WeatherUpdatesSchema = z
  .array(WeatherUpdateSchema)
  .describe('An array of weather update objects for multiple cities.');

const OperationTypeSchema = z.object({
  operationType: z
    .enum(['update/add', 'delete'])
    .describe('The type of operation to be performed on the weather data.'),
});

module.exports = {
  WeatherUpdateSchema,
  WeatherUpdatesSchema,
  OperationTypeSchema,
};
