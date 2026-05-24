document.addEventListener('DOMContentLoaded', function() {
  updateTime();
  setInterval(updateTime, 1000);
  fetchWeather();
  setInterval(fetchWeather, 30 * 60 * 1000);
  typeWriter();
  typewriterEffect();
  typeLogLines();
});

function updateTime() {
  const now = new Date();
  
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekday = weekdays[now.getDay()];
  
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const dateLine = document.getElementById('date');
  const timeLine = document.getElementById('time');
  
  if (dateLine) {
    dateLine.textContent = `${year}年${month}月${day}日 ${weekday}`;
  }
  
  if (timeLine) {
    timeLine.textContent = `${hours}:${minutes}:${seconds}`;
  }
}

async function fetchWeather() {
  const weatherLine = document.getElementById('weather');
  if (!weatherLine) return;

  weatherLine.textContent = '加载中...';

  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=32.01&longitude=120.86&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&timezone=Asia/Shanghai');
    
    if (!response.ok) {
      throw new Error('天气数据获取失败');
    }
    
    const data = await response.json();
    
    const temp = Math.round(data.current.temperature_2m);
    const weatherCode = data.current.weather_code;
    const windSpeed = Math.round(data.current.wind_speed_10m);
    const windDirection = getWindDirection(data.current.wind_direction_10m);
    
    const weatherDesc = getWeatherDescription(weatherCode);
    
    weatherLine.textContent = `南通 ${weatherDesc} ${temp}°C ${windDirection}风${windSpeed}级`;
    
  } catch (error) {
    weatherLine.textContent = '南通 多云 25°C 西南风2级';
  }
}

function getWeatherDescription(code) {
  if (code === 0) return '晴';
  if (code >= 1 && code <= 3) return '多云';
  if (code >= 45 && code <= 48) return '雾';
  if (code >= 51 && code <= 67) return '小雨';
  if (code >= 71 && code <= 80) return '小雪';
  if (code >= 81 && code <= 99) return '雨';
  return '多云';
}

function getWindDirection(degrees) {
  const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

const socialLinks = document.querySelectorAll('.social-link');
socialLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    if (this.classList.contains('social-link--qrcode')) {
      e.preventDefault();
    }
  });
});

const navItems = document.querySelectorAll('.nav-item:not(.nav-item--disabled)');
navItems.forEach(item => {
  item.addEventListener('click', function(e) {
    if (!this.getAttribute('href') || this.getAttribute('href') === '#') {
      e.preventDefault();
    }
  });
});

function createStars() {
  const scene = document.querySelector('.bg-scene');
  if (!scene) return;
  
  for (let i = 0; i < 50; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.width = `${Math.random() * 2 + 1}px`;
    star.style.height = star.style.width;
    star.style.animationDelay = `${Math.random() * 3}s`;
    star.style.animationDuration = `${Math.random() * 2 + 2}s`;
    scene.appendChild(star);
  }
}

createStars();

const audio = document.getElementById('audio');
const musicPlayer = document.getElementById('musicPlayer');

function toggleMusic() {
  const playBtn = document.querySelector('.play-btn');
  
  if (audio.paused) {
    audio.play();
    musicPlayer.classList.add('playing');
    playBtn.textContent = '⏸';
  } else {
    audio.pause();
    musicPlayer.classList.remove('playing');
    playBtn.textContent = '▶';
  }
}

audio.addEventListener('ended', function() {
  audio.currentTime = 0;
  audio.play();
});

const gameBtn = document.getElementById('gameBtn');
const gameModal = document.getElementById('gameModal');
const closeGame = document.getElementById('closeGame');

if (gameBtn && gameModal && closeGame) {
  gameBtn.addEventListener('click', function(e) {
    e.preventDefault();
    gameModal.classList.add('active');
    setTimeout(function() {
      canvas.focus();
    }, 100);
  });

  closeGame.addEventListener('click', function() {
    gameModal.classList.remove('active');
  });

  gameModal.addEventListener('click', function(e) {
    if (e.target === gameModal) {
      gameModal.classList.remove('active');
      stopGame();
    }
  });
}

const radarBtn = document.getElementById('radarBtn');
const newsModal = document.getElementById('newsModal');
const closeNews = document.getElementById('closeNews');
const newsList = document.getElementById('newsList');

if (radarBtn && newsModal && closeNews) {
  radarBtn.addEventListener('click', function(e) {
    e.preventDefault();
    newsModal.classList.add('active');
    loadTechNews();
  });

  closeNews.addEventListener('click', function() {
    newsModal.classList.remove('active');
  });

  newsModal.addEventListener('click', function(e) {
    if (e.target === newsModal) {
      newsModal.classList.remove('active');
    }
  });
}

function loadTechNews() {
  if (!newsList) return;
  
  newsList.innerHTML = `
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>正在连接卫星信号<span class="dots">...</span></p>
    </div>
  `;

  fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
    .then(function(response) { return response.json(); })
    .then(function(data) {
      const topStories = data.slice(0, 8);
      const promises = topStories.map(function(id) {
        return fetch('https://hacker-news.firebaseio.com/v0/item/' + id + '.json')
          .then(function(res) { return res.json(); });
      });

      return Promise.all(promises);
    })
    .then(function(stories) {
      renderNews(stories);
    })
    .catch(function(error) {
      newsList.innerHTML = `
        <div class="news-empty">
          <p>⚠ 信号接收失败</p>
          <p style="font-size: 12px; opacity: 0.6;">请检查网络连接后重试</p>
        </div>
      `;
    });
}

function renderNews(stories) {
  if (!newsList || !stories || stories.length === 0) {
    newsList.innerHTML = `
      <div class="news-empty">
        <p>📡 暂无科技情报</p>
      </div>
    `;
    return;
  }

  let html = '';
  stories.forEach(function(story) {
    if (story && story.title) {
      const url = story.url || 'https://news.ycombinator.com/item?id=' + story.id;
      const domain = story.url ? new URL(story.url).hostname.replace('www.', '') : 'news.ycombinator.com';
      
      html += `
        <a href="${url}" target="_blank" class="news-item">
          <div class="news-meta">
            <span class="news-source">${domain}</span>
          </div>
          <p class="news-title">${story.title}</p>
        </a>
      `;
    }
  });

  newsList.innerHTML = html || '<div class="news-empty"><p>📡 暂无科技情报</p></div>';
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('startGame');

let snake = [];
let food = { x: 0, y: 0 };
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let score = 0;
let gameLoop = null;
let gameRunning = false;

const gridSize = 20;
const canvasWidth = 600;
const canvasHeight = 400;

if (canvas) {
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.width = canvasWidth + 'px';
  canvas.style.height = canvasHeight + 'px';
}

function initGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  updateScore();
  spawnFood();
  gameRunning = true;
}

function spawnFood() {
  food = {
    x: Math.floor(Math.random() * (canvasWidth / gridSize)),
    y: Math.floor(Math.random() * (canvasHeight / gridSize))
  };
}

function updateScore() {
  if (scoreDisplay) {
    scoreDisplay.textContent = score;
  }
}

function draw() {
  if (!ctx) return;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  snake.forEach((segment, index) => {
    if (index === 0) {
      ctx.fillStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 10;
    } else {
      ctx.fillStyle = '#00ff88';
      ctx.shadowBlur = 0;
    }
    
    ctx.beginPath();
    ctx.roundRect(
      segment.x * gridSize + 1,
      segment.y * gridSize + 1,
      gridSize - 2,
      gridSize - 2,
      4
    );
    ctx.fill();
  });
  
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#ffd700';
  const foodGradient = ctx.createRadialGradient(
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    0,
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    gridSize / 2
  );
  foodGradient.addColorStop(0, '#ffdd00');
  foodGradient.addColorStop(1, '#ff8800');
  ctx.fillStyle = foodGradient;
  ctx.beginPath();
  ctx.arc(
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    gridSize / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  
  ctx.shadowBlur = 0;
}

function update() {
  direction = { ...nextDirection };
  
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };
  
  if (head.x < 0 || head.x >= canvasWidth / gridSize ||
      head.y < 0 || head.y >= canvasHeight / gridSize) {
    gameOver();
    return;
  }
  
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver();
      return;
    }
  }
  
  snake.unshift(head);
  
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    updateScore();
    spawnFood();
  } else {
    snake.pop();
  }
}

function gameOver() {
  gameRunning = false;
  clearInterval(gameLoop);
  
  if (!ctx) return;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff4444';
  ctx.shadowColor = '#ff0000';
  ctx.shadowBlur = 20;
  ctx.fillText('Game Over', canvasWidth / 2, canvasHeight / 2 - 30);
  
  ctx.font = '20px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#ffd700';
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 10;
  ctx.fillText(`最终得分: ${score}`, canvasWidth / 2, canvasHeight / 2 + 10);
  ctx.fillText('按 空格键 或 点击按钮 重新开始', canvasWidth / 2, canvasHeight / 2 + 50);
  
  ctx.shadowBlur = 0;
}

function gameStep() {
  update();
  draw();
}

function startGame() {
  stopGame();
  initGame();
  draw();
  gameLoop = setInterval(gameStep, 120);
}

function stopGame() {
  if (gameLoop) {
    clearInterval(gameLoop);
    gameLoop = null;
  }
  gameRunning = false;
}

if (startBtn) {
  startBtn.addEventListener('click', startGame);
}

if (canvas) {
  canvas.addEventListener('click', function() {
    if (!gameRunning) {
      startGame();
    }
  });
  
  canvas.addEventListener('keydown', function(e) {
    if (!gameRunning && e.code === 'Space') {
      e.preventDefault();
      startGame();
      return;
    }
    
    switch(e.code) {
      case 'ArrowUp':
      case 'KeyW':
        e.preventDefault();
        if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
      case 'KeyS':
        e.preventDefault();
        if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
      case 'KeyA':
        e.preventDefault();
        if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
      case 'KeyD':
        e.preventDefault();
        if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
        break;
      case 'Space':
        e.preventDefault();
        if (!gameRunning) startGame();
        break;
    }
  });
  
  document.addEventListener('keydown', function(e) {
    if (!gameRunning && e.code === 'Space') {
      e.preventDefault();
    }
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      if (document.activeElement === canvas || document.activeElement === document.body) {
        e.preventDefault();
      }
    }
  });
}

function typeWriter() {
  const typewriterElement = document.getElementById('typewriter');
  if (!typewriterElement) return;
  
  const text = typewriterElement.textContent;
  typewriterElement.textContent = '';
  
  let i = 0;
  const speed = 100;
  
  function type() {
    if (i < text.length) {
      typewriterElement.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  setTimeout(type, 800);
}

function typewriterEffect() {
  const titleElement = document.getElementById('typewriterTitle');
  if (!titleElement) return;
  
  const text = titleElement.textContent;
  const fullText = text;
  titleElement.textContent = '';
  titleElement.style.borderRight = '2px solid #d4af37';
  
  let i = 0;
  const speed = 80;
  
  function type() {
    if (i < fullText.length) {
      titleElement.textContent += fullText.charAt(i);
      i++;
      setTimeout(type, speed);
    } else {
      setTimeout(function() {
        titleElement.style.borderRight = 'none';
      }, 1500);
    }
  }
  
  setTimeout(type, 500);
}

const logLines = [
  '正在通过云计算技术构建数字方舟...',
  '当前坐标：南通师范高等专科学校。',
  '核心任务：探索技术与认知的边界。'
];

function typeLogLines() {
  const line1 = document.getElementById('logLine1');
  const line2 = document.getElementById('logLine2');
  const line3 = document.getElementById('logLine3');
  if (!line1 || !line2 || !line3) return;

  let lineIndex = 0;
  let charIndex = 0;
  const baseSpeed = 60;

  function typeNextChar() {
    const currentLine = [line1, line2, line3][lineIndex];
    if (!currentLine) return;

    if (lineIndex < logLines.length) {
      const fullText = logLines[lineIndex];
      
      if (charIndex < fullText.length) {
        currentLine.textContent += fullText.charAt(charIndex);
        charIndex++;
        const randomDelay = baseSpeed + Math.random() * 40;
        setTimeout(typeNextChar, randomDelay);
      } else {
        lineIndex++;
        charIndex = 0;
        if (lineIndex < logLines.length) {
          setTimeout(typeNextChar, 400);
        }
      }
    }
  }

  setTimeout(typeNextChar, 2000);
}

document.querySelectorAll('.glass-card').forEach(function(card) {
  card.addEventListener('mousemove', function(e) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.02, 1.02, 1.02)';
    card.classList.add('tilt');
  });

  card.addEventListener('mouseleave', function() {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    card.classList.remove('tilt');
  });
});

const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navGrid = document.getElementById('navGrid');

if (mobileMenuBtn && navGrid) {
  mobileMenuBtn.addEventListener('click', function() {
    mobileMenuBtn.classList.toggle('active');
    navGrid.classList.toggle('active');
  });

  navGrid.querySelectorAll('.nav-item').forEach(function(item) {
    item.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        mobileMenuBtn.classList.remove('active');
        navGrid.classList.remove('active');
      }
    });
  });
}