import { describe, it, expect, vi } from "vitest";
import { getCharacter } from "../../src/tools/character.js";
import type { DdbClient } from "../../src/api/client.js";
import type { DdbCharacter } from "../../src/types/character.js";
import type { DdbCampaign } from "../../src/types/api.js";

function createMockClient(): DdbClient {
  return { get: vi.fn(), getRaw: vi.fn() } as unknown as DdbClient;
}

const mockCampaigns: DdbCampaign[] = [
  { id: 999, name: "Test Campaign", dmId: 1, dmUsername: "dm", playerCount: 1, dateCreated: "1/1/2026" },
];

const mockCampaignCharacters = [
  { id: 4242, name: "Krisk", userId: 1, userName: "player1", avatarUrl: "", characterStatus: 0, isAssigned: true },
];

function createBard(overrides: Partial<DdbCharacter> = {}): DdbCharacter {
  const base = {
    id: 4242,
    readonlyUrl: "",
    name: "Krisk",
    race: {
      fullName: "Lizardfolk",
      baseRaceName: "Lizardfolk",
      isHomebrew: false,
      racialTraits: [
        {
          definition: {
            id: 1,
            name: "Languages",
            description: "<p>You can speak Common and one other language of your choice.</p>",
          },
        },
      ],
    },
    classes: [
      {
        id: 1,
        definition: {
          name: "Bard",
          spellRules: {
            // index by character level; level 3 → 4 first-level + 2 second-level slots
            levelSpellSlots: [
              [],
              [2, 0, 0, 0, 0, 0, 0, 0, 0],
              [3, 0, 0, 0, 0, 0, 0, 0, 0],
              [4, 2, 0, 0, 0, 0, 0, 0, 0],
            ],
          },
        },
        subclassDefinition: { name: "College of Glamour", classFeatures: [] },
        level: 3,
        isStartingClass: true,
        classFeatures: [],
      },
    ],
    background: { definition: null },
    stats: [
      { id: 1, value: 8 },
      { id: 2, value: 14 },
      { id: 3, value: 14 },
      { id: 4, value: 8 },
      { id: 5, value: 12 },
      { id: 6, value: 15 },
    ],
    bonusStats: [{ id: 6, value: 2 }],
    overrideStats: [],
    modifiers: { race: [], class: [], background: [], item: [], feat: [], condition: [] },
    baseHitPoints: 24,
    bonusHitPoints: null,
    overrideHitPoints: null,
    removedHitPoints: 0,
    temporaryHitPoints: 0,
    currentXp: 0,
    alignmentId: 5,
    lifestyleId: 1,
    currencies: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 },
    spells: { race: [], class: [], background: [], item: [], feat: [] },
    inventory: [],
    deathSaves: { failCount: null, successCount: null, isStabilized: false },
    traits: { personalityTraits: null, ideals: null, bonds: null, flaws: null, appearance: null },
    preferences: {},
    configuration: {},
    actions: {
      class: [
        {
          id: 1,
          entityTypeId: 1,
          name: "Bardic Inspiration",
          componentId: 1,
          componentTypeId: 1,
          limitedUse: {
            maxUses: 0,
            numberUsed: 0,
            resetType: 2,
            resetTypeDescription: "",
            statModifierUsesId: 6, // Charisma
            useProficiencyBonus: false,
          },
        },
        {
          id: 2,
          entityTypeId: 1,
          name: "Hungry Jaws",
          componentId: 2,
          componentTypeId: 2,
          limitedUse: {
            maxUses: 0,
            numberUsed: 1,
            resetType: 2,
            resetTypeDescription: "",
            statModifierUsesId: null,
            useProficiencyBonus: true,
          },
        },
      ],
    },
    feats: [],
    notes: { personalPossessions: null, backstory: null, otherNotes: null, allies: null, organizations: null },
    campaign: { id: 999, name: "Test Campaign" },
    choices: {
      race: [
        { componentId: 10, label: "Choose a Language", optionValue: 4055, type: 2, subType: 3 },
      ],
      choiceDefinitions: [
        {
          options: [
            { id: 4050, label: "Common" },
            { id: 4052, label: "Draconic" },
            { id: 4055, label: "Elvish" },
          ],
        },
      ],
    },
    spellSlots: [
      { level: 1, used: 0, available: 0 },
      { level: 2, used: 1, available: 0 },
    ],
    pactMagic: [],
  } as unknown as DdbCharacter;

  return { ...base, ...overrides };
}

async function renderSheet(char: DdbCharacter): Promise<string> {
  const client = createMockClient();
  vi.mocked(client.get)
    .mockResolvedValueOnce(mockCampaigns)
    .mockResolvedValueOnce(mockCampaignCharacters)
    .mockResolvedValueOnce(char);
  const result = await getCharacter(client, { characterName: "Krisk", detail: "sheet" });
  return result.content[0].text;
}

describe("character sheet reporting", () => {
  it("reports alignment from alignmentId", async () => {
    const text = await renderSheet(createBard());
    expect(text).toContain("Alignment: Neutral");
  });

  it("reports languages from builder choices and the species trait", async () => {
    const text = await renderSheet(createBard());
    expect(text).toContain("--- Languages ---");
    expect(text).toContain("Common");
    expect(text).toContain("Elvish");
  });

  it("computes spell slot maximums from the class spell table, not slot.available", async () => {
    const text = await renderSheet(createBard());
    expect(text).toContain("--- Spell Slots ---");
    expect(text).toContain("Level 1:");
    expect(text).toContain("(0/4 used)");
    expect(text).toContain("Level 2:");
    expect(text).toContain("(1/2 used)");
  });

  it("resolves limited-use maximums from ability modifier and proficiency bonus", async () => {
    const text = await renderSheet(createBard());
    // Cha 17 → +3 uses, reset on a long rest
    expect(text).toContain("Bardic Inspiration: 3/3 (long rest)");
    // Proficiency bonus +2 at level 3, one already used
    expect(text).toContain("Hungry Jaws: 1/2 (long rest)");
  });
});
