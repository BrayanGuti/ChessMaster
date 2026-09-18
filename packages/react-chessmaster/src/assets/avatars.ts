import whitePawn from './Avatars/white-pawn.png';
import blackPawn from './Avatars/black-pawn.png';

// Default player avatars. Pass `avatar` to PlayerBadge to use a custom image.
export const PLAYER_AVATARS: Record<'W' | 'B', string> = {
  W: whitePawn,
  B: blackPawn,
};
