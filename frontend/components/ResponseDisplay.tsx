import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import styles from '../styles/ResponseDisplay.module.css';

interface CodeBlock {
  language: string;
  code: string;
}

interface ResponseDisplayProps {
  question: string;
  answer: string;
  sources: string[];
  hasCode: boolean;
  codeBlocks: CodeBlock[];
  voiceAudio?: string | null;
  isLoading: boolean;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  question,
  answer,
  sources,
  hasCode,
  codeBlocks,
  voiceAudio,
  isLoading,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [displayedAnswer, setDisplayedAnswer] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (voiceAudio && audioRef.current) {
      const audioUrl = `data:audio/mp3;base64,${voiceAudio}`;
      audioRef.current.src = audioUrl;
    }
  }, [voiceAudio]);

  useEffect(() => {
    if (answer) {
      setDisplayedAnswer('');
      setIsTyping(true);
      let index = 0;
      const timer = setInterval(() => {
        if (index < answer.length) {
          setDisplayedAnswer(answer.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(timer);
        }
      }, 15);
      return () => clearInterval(timer);
    }
  }, [answer]);

  const playVoice = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const processAnswer = (text: string) => {
    return text
      .replace(/^### (.+)$/gm, '<h3 class="' + styles.heading3 + '">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="' + styles.heading2 + '">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="' + styles.heading1 + '">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="' + styles.bold + '">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="' + styles.italic + '">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="' + styles.inlineCode + '">$1</code>')
      .replace(/^- (.+)$/gm, '<li class="' + styles.listItem + '">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="' + styles.listItem + ' numbered">$1</li>')
      .replace(/\n\n/g, '</p><p class="' + styles.paragraph + '">')
      .replace(/\n/g, '<br/>');
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <div className={styles.loadingText}>
            <span className={styles.loadingDots}>
              <span></span>
              <span></span>
              <span></span>
            </span>
            <p>Analyzing codebase...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!question && !answer) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🤖</div>
          <h2>Making Repos Speakable</h2>
          <p>Ask a question to get started!</p>
          <div className={styles.emptyHints}>
            <div className={styles.hintItem}>
              <span className={styles.hintIcon}>1️⃣</span>
              <span>Enter a GitHub repo URL</span>
            </div>
            <div className={styles.hintItem}>
              <span className={styles.hintIcon}>2️⃣</span>
              <span>Ingest the repository</span>
            </div>
            <div className={styles.hintItem}>
              <span className={styles.hintIcon}>3️⃣</span>
              <span>Ask anything about the code</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderAnswerContent = () => {
    if (!displayedAnswer) return null;
    
    const parts: JSX.Element[] = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    let partIndex = 0;

    while ((match = codeBlockRegex.exec(displayedAnswer)) !== null) {
      if (match.index > lastIndex) {
        const textPart = displayedAnswer.slice(lastIndex, match.index);
        parts.push(
          <div key={`text-${partIndex}`} className={styles.markdownContent}>
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className={styles.heading1}>{children}</h1>,
                h2: ({ children }) => <h2 className={styles.heading2}>{children}</h2>,
                h3: ({ children }) => <h3 className={styles.heading3}>{children}</h3>,
                p: ({ children }) => <p className={styles.paragraph}>{children}</p>,
                ul: ({ children }) => <ul className={styles.list}>{children}</ul>,
                ol: ({ children }) => <ol className={styles.list}>{children}</ol>,
                li: ({ children }) => <li className={styles.listItem}>{children}</li>,
                strong: ({ children }) => <strong className={styles.bold}>{children}</strong>,
                em: ({ children }) => <em className={styles.italic}>{children}</em>,
                code: ({ className, children, ...props }) => {
                  if (!className) {
                    return <code className={styles.inlineCode}>{children}</code>;
                  }
                  return <code className={className}>{children}</code>;
                },
              }}
            >
              {textPart}
            </ReactMarkdown>
          </div>
        );
        partIndex++;
      }

      const language = match[1] || 'text';
      const code = match[2].trim();
      parts.push(
        <div key={`code-${partIndex}`} className={styles.codeBlock}>
          <div className={styles.codeHeader}>
            <span className={styles.codeLanguage}>{language}</span>
            <button
              className={styles.copyButton}
              onClick={() => navigator.clipboard.writeText(code)}
            >
              📋 Copy
            </button>
          </div>
          <SyntaxHighlighter
            language={language}
            style={atomDark}
            showLineNumbers
            customStyle={{
              margin: 0,
              borderRadius: '0 0 12px 12px',
              fontSize: '0.9rem',
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );
      partIndex++;
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < displayedAnswer.length) {
      const textPart = displayedAnswer.slice(lastIndex);
      parts.push(
        <div key={`text-${partIndex}`} className={styles.markdownContent}>
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className={styles.heading1}>{children}</h1>,
              h2: ({ children }) => <h2 className={styles.heading2}>{children}</h2>,
              h3: ({ children }) => <h3 className={styles.heading3}>{children}</h3>,
              p: ({ children }) => <p className={styles.paragraph}>{children}</p>,
              ul: ({ children }) => <ul className={styles.list}>{children}</ul>,
              ol: ({ children }) => <ol className={styles.list}>{children}</ol>,
              li: ({ children }) => <li className={styles.listItem}>{children}</li>,
              strong: ({ children }) => <strong className={styles.bold}>{children}</strong>,
              em: ({ children }) => <em className={styles.italic}>{children}</em>,
              code: ({ className, children, ...props }) => {
                if (!className) {
                  return <code className={styles.inlineCode}>{children}</code>;
                }
                return <code className={className}>{children}</code>;
              },
            }}
          >
            {textPart}
          </ReactMarkdown>
        </div>
      );
    }

    return parts;
  };

  return (
    <div className={styles.container}>
      <div className={styles.questionSection}>
        <div className={styles.labelRow}>
          <span className={styles.labelIcon}>❓</span>
          <span className={styles.label}>Question</span>
        </div>
        <div className={styles.question}>{question}</div>
      </div>
      
      <div className={styles.answerSection}>
        <div className={styles.labelRow}>
          <span className={styles.labelIcon}>💡</span>
          <span className={styles.label}>Answer</span>
          {isTyping && <span className={styles.typingIndicator}><span></span><span></span><span></span></span>}
        </div>
        {voiceAudio && (
          <button className={styles.voiceButton} onClick={playVoice}>
            <span className={styles.voiceIcon}>🔊</span>
            Play Voice
          </button>
        )}
        <audio ref={audioRef} className={styles.hiddenAudio} controls />
        
        <div className={styles.answer}>
          {renderAnswerContent()}
        </div>
      </div>

      {sources.length > 0 && (
        <div className={styles.sourcesSection}>
          <div className={styles.labelRow}>
            <span className={styles.labelIcon}>📚</span>
            <span className={styles.label}>Sources</span>
          </div>
          <div className={styles.sources}>
            {sources.map((source, index) => (
              <span key={index} className={styles.source}>
                📄 {source}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponseDisplay;
