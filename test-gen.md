# Test Generator

Aim: Verify the extractor against an unlimited number of generated test cases.

## Random variables

| Variable | Range |
|-:|:-|
| Species | \<random> |
| Mode | Wild/Tamed/Bred |
| TE, if not Wild | 0-100% |
| Imprint, if Bred | 0-100% |
| Wild levels, per stat | 0-255 |
| Domestic levels, per stat, if not Wild | 0-255 (lower more common) |
| Single player | true/false |
| Server multipliers| [see Section]  |
| Server IBM | 0.1-5 |

## Server multipliers

Official settings should be used for the majority of tests.

Variations should be sane floats with no more than 3 decimal places. The maximum tested multiplier will be 20.

## Creature generation

Ensure torpor level is calculated from wild level and that wild levels add up to torpor level.
