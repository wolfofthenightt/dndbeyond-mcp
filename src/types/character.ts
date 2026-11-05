export interface DdbCharacter {
  id: number;
  readonlyUrl: string;
  name: string;
  race: DdbRace;
  classes: DdbClass[];
  background: DdbBackground;
  stats: DdbAbilityScore[];
  bonusStats: DdbAbilityScore[];
  overrideStats: DdbAbilityScore[];
  baseHitPoints: number;
  bonusHitPoints: number | null;
  overrideHitPoints: number | null;
  removedHitPoints: number;
  temporaryHitPoints: number;
  currentXp: number;
  alignmentId: number;
  lifestyleId: number;
  currencies: DdbCurrencies;
  spells: DdbSpellsContainer;
  /** DDB v5: class spells live here, grouped by class. */
  classSpells?: DdbClassSpellGroup[] | null;
  inventory: DdbInventoryItem[];
  deathSaves: DdbDeathSaves;
  traits: DdbTraits;
  preferences: Record<string, unknown>;
  configuration: Record<string, unknown>;
  actions: Record<string, DdbAction[]>;
  modifiers: Record<string, DdbModifier[]>;
  campaign: { id: number; name: string } | null;
  feats: DdbFeat[];
  notes: DdbNotes;
  level?: number;
  /** DDB returns one entry per pact slot level; entries with 0 available are unused. */
  pactMagic?: Array<{
    level: number;
    used: number;
    available: number;
  }> | null;
  spellSlots?: Array<{
    level: number;
    used: number;
    available: number;
  }>;
  hitDiceUsed?: number;
  /** Builder selections (ability score increases, languages, skill picks, …). */
  choices?: DdbChoices | null;
}

export interface DdbChoiceOption {
  id: number;
  label: string;
}

export interface DdbChoice {
  componentId: number;
  label: string | null;
  optionValue: number | null;
  type: number;
  subType: number | null;
  optionIds?: number[];
}

export interface DdbChoices {
  race?: DdbChoice[] | null;
  class?: DdbChoice[] | null;
  background?: DdbChoice[] | null;
  feat?: DdbChoice[] | null;
  item?: DdbChoice[] | null;
  choiceDefinitions?: Array<{ options?: DdbChoiceOption[] | null }> | null;
}

export interface DdbRace {
  fullName: string;
  baseRaceName: string;
  isHomebrew: boolean;
  racialTraits: DdbRacialTrait[];
}

export interface DdbClass {
  id: number;
  definition: {
    id: number;
    name: string;
    /** Spell table for this class. `levelSpellSlots[classLevel]` is the slot array (index 0 = 1st level). */
    spellRules?: {
      levelSpellSlots?: number[][] | null;
      levelCantripsKnownMaxes?: number[] | null;
    } | null;
  };
  subclassDefinition: { name: string; classFeatures: DdbClassFeature[] } | null;
  level: number;
  isStartingClass: boolean;
  classFeatures: DdbClassFeature[];
}

export interface DdbBackground {
  definition: {
    name: string;
    description: string;
    featureName: string | null;
    featureDescription: string | null;
    snippet: string | null;
    skillProficienciesDescription: string | null;
    toolProficienciesDescription: string | null;
    equipmentDescription: string | null;
  } | null;
}

export interface DdbAbilityScore {
  id: number; // 1=STR, 2=DEX, 3=CON, 4=INT, 5=WIS, 6=CHA
  value: number | null;
}

export interface DdbCurrencies {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

export interface DdbSpellsContainer {
  race: DdbSpell[] | null;
  class: DdbSpell[] | null;
  background: DdbSpell[] | null;
  item: DdbSpell[] | null;
  feat: DdbSpell[] | null;
}

export interface DdbSpell {
  id: number;
  definition: {
    name: string;
    level: number;
    school: string;
    description: string;
    range: {
      origin: string;
      rangeValue: number | null;
      aoeType: string | null;
      aoeValue: number | null;
    } | null;
    duration: {
      durationInterval: number | null;
      durationUnit: string | null; // "Hour", "Minute", etc.
      durationType: string; // "Concentration" or "Time"
    } | null;
    activation: {
      activationTime: number;
      activationType: number; // 1=Action, 3=Bonus Action, 6=Reaction
    } | null;
    components: number[] | null; // 1=V, 2=S, 3=M
    componentsDescription: string | null;
    concentration: boolean;
    ritual: boolean;
  };
  prepared: boolean;
  alwaysPrepared: boolean;
  /** True for spells on the character's known list (DDB's `classSpells`). */
  countsAsKnownSpell?: boolean;
  usesSpellSlot?: boolean;
}

/** DDB v5 groups class spells by class instead of the legacy `spells.class` array. */
export interface DdbClassSpellGroup {
  characterClassId: number;
  spells: DdbSpell[];
}

export interface DdbInventoryItem {
  id: number;
  definition: {
    name: string;
    description: string;
    type: string;
    rarity: string;
    weight: number;
    cost: number | null;
    isHomebrew: boolean;
    armorClass?: number | null;
    filterType?: string;
  };
  equipped: boolean;
  quantity: number;
}

export interface DdbDeathSaves {
  failCount: number | null;
  successCount: number | null;
  isStabilized: boolean;
}

export interface DdbTraits {
  personalityTraits: string | null;
  ideals: string | null;
  bonds: string | null;
  flaws: string | null;
  appearance: string | null;
}

export interface DdbLimitedUse {
  maxUses: number;
  numberUsed: number;
  /** 1 = short rest, 2 = long rest (per DDB's action payload). */
  resetType: number;
  resetTypeDescription: string;
  /** When set, max uses equals this ability's modifier (1=STR … 6=CHA). */
  statModifierUsesId?: number | null;
  /** When true, max uses equals the proficiency bonus. */
  useProficiencyBonus?: boolean;
  operator?: number;
  resetDice?: unknown;
}

export interface DdbAction {
  id: number;
  entityTypeId: number;
  name: string;
  componentId: number;
  componentTypeId: number;
  limitedUse: DdbLimitedUse | null;
}

export interface DdbModifier {
  id: string | number;
  type: string;
  subType: string;
  value: number | null;
  friendlyTypeName: string;
  friendlySubtypeName: string;
  componentId: number;
  componentTypeId: number;
}

export interface DdbFeat {
  definition: {
    name: string;
    description: string;
    snippet: string | null;
    prerequisite: string | null;
  };
  componentId: number;
  componentTypeId: number;
}

export interface DdbClassFeature {
  // Class features nest under .definition; subclass features are flat
  definition?: {
    name: string;
    requiredLevel: number;
    description: string;
    snippet: string | null;
  };
  // Flat fields (subclass features)
  name?: string;
  requiredLevel?: number;
  description?: string;
}

export interface DdbRacialTrait {
  definition: {
    name: string;
    description: string;
    snippet: string | null;
  };
}

export interface DdbNotes {
  personalPossessions: string | null;
  backstory: string | null;
  otherNotes: string | null;
  allies: string | null;
  organizations: string | null;
}

export interface CharacterSummary {
  id: number;
  name: string;
  race: string;
  classes: string;
  level: number;
  hp: { current: number; max: number; temp: number };
  ac: number;
  campaignName: string | null;
}
