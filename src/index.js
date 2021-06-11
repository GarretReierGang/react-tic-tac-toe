import React from 'react'
import ReactDOM from 'react-dom'
import './index.css';

function Square(props) {
   const className = 'square' + (props.highlight ? ' highlight' : '');
   return (
     <button 
      className={className}
      onClick={props.onClick}
     >
       {props.value}
     </button>
   );
 }
 


 class Board extends React.Component {

   renderSquare(i) {
     const winningLine = this.props.winningLine; 
     return (
       <Square
         key={i}
         value={this.props.squares[i]}
         onClick={() => this.props.onClick(i)}
         highlight={winningLine && winningLine.includes(i)}
       />
     );
   }
 
   render() {  
      const boardSize = this.props.boardSize; 
      let board = [];
      
      for (let x=0; x < boardSize; ++x)
      {
         let row= [];
         for (let y=0; y < boardSize; ++y)
         {
            row.push(this.renderSquare(x * boardSize + y));
         } 
         board.push(<div key={x} className="board-row">{row}</div>)
      }
   
     return (
       <div>
         {board}
       </div>
     );
   }
 }
 
 class Game extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         history: [{
            squares: Array(props.boardSize * props.boardSize).fill(null),
            squareMarked: null,
            won: false
         }],
         xIsNext: true,
         currentMove: 0,
         boardSize: props.boardSize,
         lines: determineLines(props.boardSize),
         isAscending: true,
      };
   }
    
   handleSortToggle() {
      this.setState({
         isAscending: !this.state.isAscending
      });
   }
 
   handleClick(i) {
      const history = this.state.history.slice(0, this.state.currentMove + 1);
      const current = history[history.length-1];
      const squares = current.squares.slice();
      if (calculateWinner(current.squares, this.state.lines).winner || squares[i]) {
         return; // Ignore a click if the square is filled, or there is a winner.
      }
      squares[i] = this.state.xIsNext ? 'X' : 'O';
      this.setState({
         history: history.concat([{
            squares: squares,
            squareMarked: i
         }]),
         xIsNext: !this.state.xIsNext,
         currentMove: history.length,
      });
   }
   jumpTo(i) {
      this.setState({
         currentMove: i,
         xIsNext: (i%2 === 0),
      })
   }

   render() {
      const boardSize = this.state.boardSize;
      const history = this.state.history;
      const current = history[this.state.currentMove];
      const winInfo = calculateWinner(current.squares, this.state.lines);
      let status = (this.state.currentMove===boardSize*boardSize) ? 'Draw' : (winInfo.winner ? 
          'Winner: ' + winInfo.winner:
          'Next player: ' + (this.state.xIsNext ? 'X':
                                                  'O'));

      let moveHistory = history.map((step, move) => {
         const desc = move ? 'Go to move #' + move + '(' + step.squareMarked % boardSize +',' + Math.floor(step.squareMarked / boardSize) + ')':
                             'Go to game start';
         const ConditionalWrapper = ({ condition, wrapper, children }) =>
            condition ? wrapper(children) : children;
         return (
            <li key={move}>
               <button onClick={() => this.jumpTo(move)}>
                  <ConditionalWrapper
                     condition={move===this.state.currentMove}
                     wrapper={children=> <strong>{children}</strong>}>
                        {desc}
                     </ConditionalWrapper>
               </button>
            </li>
         )
      });

      const isAscending = this.state.isAscending;
      if (!isAscending) {
         moveHistory.reverse();
      }
      
      return (
         <div className="game">
         <div className="game-board">
            <Board
               squares={current.squares}
               onClick={(i) => this.handleClick(i)}
               boardSize={boardSize}
               winningLine={winInfo.line}
            />
         </div>
         <div className="game-info">
            <div>{status}</div>
            <button onClick={()=> this.handleSortToggle()}>
               {isAscending ? 'descending' : 'ascending'}
            </button>
            <ol>{moveHistory}</ol>
         </div>
         </div>
      );
   }
 }
 
 // ========================================
 
 ReactDOM.render(
   <Game boardSize='4'/>,
   document.getElementById('root')
 );
 
 


function calculateWinner(squares, lines) {
   for (let i = 0; i < lines.length; i++) {
   //   const [a, b, c] = lines[i];
      const a = lines[i][0];
      const line = lines[i].slice(1, lines[i].length);
      if (squares[a] && line.every( (n) => squares[n] === squares[a] ))
      {
         return {
            winner: squares[a],
            line: lines[i],
         }
      }
   }
   return {
      winner: null
   }
}

// 0 1
// 2 3

// 0 1 2
// 3 4 5
// 6 7 8

// 0 1 2 3
// 4 5 6 7
// 8 9 10 11
// 12 13 14 15
function determineLines(n)
{
   // Calculating horizintal/vertical lines.
   let lines = [];
   let diagonal = [];
   let antidiagonal = [];
   for (let i=0; i < n; i++)
   {
      let lineX = [];
      let lineY = [];
      for (let j=0; j<n; j++)
      {
         lineX.push(i + j*n);
         lineY.push(j + i*n);
      }
      lines.push(lineX);
      lines.push(lineY);
      diagonal.push(i + i*n);
      antidiagonal.push(i + (n-1-i) * n)
   }
   lines.push(diagonal);
   lines.push(antidiagonal);
   return lines;
}
