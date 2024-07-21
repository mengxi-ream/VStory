import { IActionsLink, IStorySpec } from '../../../../src/story/interface';
import { Story } from '../../../../src/story/story';
import React, { useEffect } from 'react';
import { ICharacterSpec } from '../../../../src/story/character';

type UnitNode = {
  category: string;
  color?: string;
  count: number;
  children?: UnitNode[];
};

const suicidePortionData: UnitNode[] = [
  {
    category: 'suicide',
    color: '#3164b4',
    count: 200
  },
  {
    category: 'not-suicide',
    count: 100
  }
];

const manInSuicideData: UnitNode[] = [
  {
    category: 'suicide',
    color: '#86b1ea',
    count: 200,
    children: [
      { category: 'man', color: '#3164b4', count: 170 },
      { category: 'not-man', count: 30 }
    ]
  },
  {
    category: 'not-suicide',
    count: 100
  }
];

const screenWidth = 1920;
const screenHeight = 1080;
const titleHeight = 254;
const titleMargin = {
  x: 100,
  y: 100
};
const vizMargin = {
  x: 100,
  y: 100
};

// the svg path is generated by: https://complexdan.com/svg-circleellipse-to-path-converter/
const circle = 'M0,32a32,32 0 1,0 64,0a32,32 0 1,0 -64,0';

function generateShapes(
  unitData: UnitNode[],
  characters: ICharacterSpec[],
  actions: IActionsLink[],
  startX: number,
  startY: number,
  radius: number,
  gap: number,
  defaultColor: string,
  numRows: number
) {
  for (let unitNode of unitData) {
    const children = unitNode.children;
    let color = unitNode.color;
    color = color ? color : defaultColor;
    if (!children) {
      for (let i = 0; i < unitNode.count; i++) {
        const numCharacters = characters.length;
        const col = Math.floor(numCharacters / numRows);
        const row = numCharacters - col * numRows;
        const id = `circle-${col}-${row}`;
        characters.push({
          type: 'ShapeComponent',
          id: id,
          zIndex: 3,
          position: {
            top: startY + row * (radius * 2 + gap),
            left: startX + col * (radius * 2 + gap),
            width: radius * 2,
            height: radius * 2
          },
          options: {
            graphic: {
              symbolType: circle,
              stroke: false,
              size: radius * 2,
              fill: color
            }
          }
        });
        actions.push({
          characterId: id,
          characterActions: [
            {
              // startTime is random from 1 to 100
              startTime: Math.floor(Math.random() * 400) + 1,
              // startTime: 1, //? Doesn't work when 0
              duration: 800,
              action: 'appear',
              payload: {
                animation: {
                  duration: 400,
                  easing: 'linear',
                  effect: 'fade'
                }
              }
            }
          ]
        });
      }
    } else {
      generateShapes(children, characters, actions, startX, startY, radius, gap, color, numRows);
    }
  }
}

function calNumCharacters(unitData: UnitNode[]): number {
  let numCharacters = 0;
  for (let unitNode of unitData) {
    const children = unitNode.children;
    if (!children) {
      numCharacters += unitNode.count;
    } else {
      numCharacters += calNumCharacters(children);
    }
  }
  return numCharacters;
}

function calNumCols(numCharacters: number, w: number, h: number): number {
  const lowerBound = ((w - h) / 3 + Math.sqrt(((w - h) * (w - h)) / 9 + 4 * w * h * numCharacters)) / (2 * w);
  const upperBound =
    ((w + 2 * h) / 3 + Math.sqrt(((w + 2 * h) * (w + 2 * h)) / 9 + 4 * w * h * numCharacters)) / (2 * w);
  console.log('lowerBound: ', lowerBound);
  console.log('upperBound: ', upperBound);

  return Math.round((lowerBound + upperBound) / 2);
}

function createUnitMatrix(unitData: UnitNode[]) {
  const numCharacters = calNumCharacters(unitData);
  const characters: ICharacterSpec[] = [];
  const actions: IActionsLink[] = [];

  const vizWidth = screenWidth - 2 * vizMargin.x;
  const vizHeight = screenHeight - titleHeight - 2 * vizMargin.y;

  const numRows = calNumCols(numCharacters, vizWidth, vizHeight);
  const numCols = Math.ceil(numCharacters / numRows);

  const radius = vizWidth / (numCols * 3 - 1);
  const gap = radius;

  const startX = vizMargin.x;
  const startY = titleHeight + (screenHeight - titleHeight - (numRows * 3 - 1) * radius) / 2;

  generateShapes(unitData, characters, actions, startX, startY, radius, gap, 'white', numRows);

  return { characters, actions };
}

const manInSuicideIcon = createUnitMatrix(manInSuicideData);
const suicideIcon = createUnitMatrix(suicidePortionData);

export const UnitVizSimple = () => {
  const id = 'unit-viz-simple';

  useEffect(() => {
    // 准备一个图表
    const spec: IStorySpec = {
      characters: [
        {
          type: 'RectComponent',
          id: 'background-top',
          zIndex: 2,
          position: {
            top: 0,
            left: 0,
            width: 1920,
            height: titleHeight
          },
          options: {
            graphic: {
              fill: '#2D6BA0',
              stroke: false
            }
          }
        },
        {
          type: 'RectComponent',
          id: 'background-bottom-filter',
          zIndex: 0,
          position: {
            top: 0,
            left: 0,
            width: screenWidth,
            height: screenHeight
          },
          options: {
            graphic: {
              fill: '#193446',
              fillOpacity: 1,
              stroke: false
            }
          }
        },
        {
          type: 'RichTextComponent',
          id: 'title_1',
          zIndex: 3,
          position: {
            top: titleHeight / 2,
            left: 1920 / 2,
            width: 1920,
            height: 1080
          },
          options: {
            graphic: {
              width: 1920 - 2 * titleMargin.x,
              height: 1080,
              fontSize: 40,
              wordBreak: 'break-word',
              textAlign: 'center',
              fill: 'white',
              fontWeight: 200,
              textConfig: [
                {
                  text: 'Nearly '
                },
                {
                  text: 'two-thirds',
                  fontWeight: 'bold'
                },
                {
                  text: ' of gun deaths are '
                },
                { text: 'suicides', fontWeight: 'bold' }
              ]
            }
          }
        },
        {
          type: 'RichTextComponent',
          id: 'title_2',
          zIndex: 3,
          position: {
            top: titleHeight / 2,
            left: 1920 / 2,
            width: 1920,
            height: 1080
          },
          options: {
            graphic: {
              width: 1920 - 2 * titleMargin.x,
              height: 1080,
              fontSize: 40,
              wordBreak: 'break-word',
              textAlign: 'center',
              fill: 'white',
              fontWeight: 200,
              textConfig: [
                {
                  text: 'Nearly '
                },
                {
                  text: 'two-thirds',
                  fontWeight: 'bold'
                },
                {
                  text: ' of gun deaths are '
                },
                { text: 'suicides', fontWeight: 'bold' }
              ]
            }
          }
        },
        ...suicideIcon.characters
      ],
      acts: [
        {
          id: 'page1',
          scenes: [
            {
              id: 'scene1',
              actions: [
                {
                  characterId: 'background-top',
                  characterActions: [
                    {
                      action: 'appear',
                      startTime: 0,
                      duration: 0
                    }
                  ]
                },
                {
                  characterId: 'background-bottom-filter',
                  characterActions: [
                    {
                      action: 'appear',
                      startTime: 0,
                      duration: 0
                    }
                  ]
                },
                {
                  characterId: 'title_1',
                  characterActions: [
                    {
                      startTime: 800,
                      duration: 800,
                      action: 'appear',
                      payload: {
                        animation: {
                          duration: 800,
                          easing: 'linear',
                          effect: 'fade'
                        }
                      }
                    }
                  ]
                },
                ...suicideIcon.actions
              ]
            }
          ]
        }
      ]
    };
    const story = new Story(spec, { dom: id, playerOption: { scaleX: 0.5, scaleY: 0.5 } });
    // const story = new Story(spec, { dom: id, playerOption: {} });
    story.play();
    window.story = story;
  }, []);

  return <div style={{ width: '1920px', height: '1080px' }} id={id}></div>;
};