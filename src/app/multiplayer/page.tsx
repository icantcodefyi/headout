import { type Metadata } from 'next';
import { MultiplayerGame } from '~/components/multiplayer/multiplayer-game';

export const metadata: Metadata = {
  title: 'Multiplayer - Globetrotter',
  description: 'Real-time multiplayer mode - race to answer correctly first!',
};

export default function MultiplayerPage() {
  return (
    <MultiplayerGame />
  );
} 