import aiChip from './Avatars/ai-chip.svg';
import { PIECE_ASSETS } from './pieces';

// Default player avatars: a white knight and a black bishop, reusing the piece images.
// Pass `avatar` to PlayerBadge to use a custom image.
export const PLAYER_AVATARS: Record<'W' | 'B', string> = {
  W: PIECE_ASSETS.WN,
  B: PIECE_ASSETS.BB,
};

/** The computer's avatar in a game against it, whatever color it plays */
export const COMPUTER_AVATAR = aiChip;
