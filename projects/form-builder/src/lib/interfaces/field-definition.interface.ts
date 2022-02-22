export interface FieldDefinition<
  Prefix extends string = 'mat',
  Name extends string = ''
> {
  type: `${Prefix}${Name}`;
}

export interface DefinitionWithConfiguration<
  Configuration,
  Prefix extends string = 'mat',
  Name extends string = ''
> extends FieldDefinition<Prefix, Name> {
  configuration?: Configuration | (() => Configuration);
}
