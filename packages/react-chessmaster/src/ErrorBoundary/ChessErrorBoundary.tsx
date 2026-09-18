import { Component, ContextType, ErrorInfo, ReactNode } from 'react';
import { ChessStoreContext } from '../store/ChessGameProvider';
import styles from './ChessErrorBoundary.module.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ChessErrorBoundary extends Component<Props, State> {
  static contextType = ChessStoreContext;
  declare context: ContextType<typeof ChessStoreContext>;

  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ChessBoard crashed:', error, info.componentStack);
  }

  handleRestart = () => {
    this.context?.getState().resetGame();
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorPanel}>
          <p className={styles.errorMessage}>Something went wrong with the board.</p>
          <button className={styles.errorButton} onClick={this.handleRestart}>
            Restart game
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
