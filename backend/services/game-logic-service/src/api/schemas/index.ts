import Joi from 'joi';

export const startGameSchema = Joi.object({
  playerIds: Joi.array()
    .items(Joi.string().required())
    .min(2)
    .max(8)
    .required()
});

export const submitActionSchema = Joi.object({
  playerId: Joi.string().required(),
  actionType: Joi.string().required(),
  parameters: Joi.object().required()
});
