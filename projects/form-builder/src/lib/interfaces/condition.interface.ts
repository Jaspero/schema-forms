

export enum ConditionType {
  Function = 'function',
  Statement = 'statement'
}

export enum ConditionAction {
  Show = 'show',
  Hide = 'hide'
}

export enum ConditionEvaluate {
  OnLoad = 'onLoad',
  OnChange = 'onChange'
}

export interface Condition {

  /**
   * Defaults to function
   */
  type?: ConditionType;

  /**
   * Stringified condition that could
   * later also be an object representing
   * a more complex statement
   */
  condition?: string;

  /**
   * Defaults to show
   */
  action?: ConditionAction;

  /**
   * Not always required; depends on
   * condition type
   */
  data?: any;

  /**
   * Empty or undefined means evaluate always
   */
  evaluateStates?: number[];

  /**
   * Defaults to OnLoad
   */
  evaluateOn?: ConditionEvaluate;
}

export interface CompiledCondition {
  type: ConditionType;
  action: ConditionAction;
  condition: (data?: any) => any;
  evaluateStates: number[];
  evaluateOn: ConditionEvaluate;
  data?: any;
}
