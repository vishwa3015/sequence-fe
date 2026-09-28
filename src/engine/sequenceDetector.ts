import type { BoardCell, Sequence } from '../types/game';

type Direction = { dr: number; dc: number; name: 'horizontal' | 'vertical' | 'diagonal' };

const DIRECTIONS: Direction[] = [
  { dr: 0, dc: 1, name: 'horizontal' },
  { dr: 1, dc: 0, name: 'vertical' },
  { dr: 1, dc: 1, name: 'diagonal' },
  { dr: 1, dc: -1, name: 'diagonal' },
];

export function getSequenceKey(cells: { row: number; col: number }[]): string {
  const sorted = [...cells].sort((a, b) => (a.row === b.row ? a.col - b.col : a.row - b.row));
  return sorted.map(c => `${c.row},${c.col}`).join(';');
}

export function detectNewSequences(
  board: BoardCell[][],
  teamId: number,
  playerId: string,
  existingSequences: Sequence[]
): { newSequences: Sequence[]; updatedBoard: BoardCell[][] } {
  const existingKeys = new Set(existingSequences.map(s => getSequenceKey(s.cells)));
  const teamExistingSeqs = existingSequences.filter(s => s.teamId === teamId);
  const newSequences: Sequence[] = [];
  const updatedBoard = board.map(row => row.map(cell => ({ ...cell })));

  const isCellForTeam = (r: number, c: number): boolean => {
    if (r < 0 || r >= 10 || c < 0 || c >= 10) return false;
    const cell = updatedBoard[r][c];
    if (cell.isCorner) return true;
    return cell.chip !== null && cell.chip.teamId === teamId;
  };

  const countSharedCells = (lineCells: { row: number; col: number }[], existingSeq: Sequence): number => {
    let shared = 0;
    for (const lc of lineCells) {
      if (!updatedBoard[lc.row][lc.col].isCorner) {
        if (existingSeq.cells.some(ec => ec.row === lc.row && ec.col === lc.col)) {
          shared++;
        }
      }
    }
    return shared;
  };

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      for (const dir of DIRECTIONS) {
        const lineCells: { row: number; col: number }[] = [];
        let valid = true;

        for (let step = 0; step < 5; step++) {
          const nr = r + step * dir.dr;
          const nc = c + step * dir.dc;
          if (isCellForTeam(nr, nc)) {
            lineCells.push({ row: nr, col: nc });
          } else {
            valid = false;
            break;
          }
        }

        if (valid && lineCells.length === 5) {
          const nonCornerChips = lineCells.filter(
            lc => !updatedBoard[lc.row][lc.col].isCorner && updatedBoard[lc.row][lc.col].chip?.teamId === teamId
          );

          if (nonCornerChips.length >= 3) {
            const key = getSequenceKey(lineCells);
            if (!existingKeys.has(key)) {
              const isOverlappingTooMuch = [...teamExistingSeqs, ...newSequences].some(
                seq => countSharedCells(lineCells, seq) > 1
              );

              if (!isOverlappingTooMuch) {
                existingKeys.add(key);

                const seqId = `seq-${teamId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                const sequence: Sequence = {
                  id: seqId,
                  teamId,
                  playerId,
                  cells: lineCells,
                  type: dir.name,
                };

                newSequences.push(sequence);

                lineCells.forEach(lc => {
                  const cell = updatedBoard[lc.row][lc.col];
                  if (!cell.isCorner && cell.chip) {
                    cell.chip = {
                      ...cell.chip,
                      isPartOfSequence: true,
                    };
                    cell.sequenceId = seqId;
                  }
                });
              }
            }
          }
        }
      }
    }
  }

  return { newSequences, updatedBoard };
}
