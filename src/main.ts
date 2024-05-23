interface Circle {
    x: number;
    y: number;
    sharav: number;
    speedX: number; 
    speedY: number;
    hold: boolean; 
    qash: number; 
    color: string;
  }
  
  const gra = 0.2;
  const damp = 0.7;
  const colors = ['blue', 'yellow', 'red', 'green', 'purple','orange','grey','brown'];
  
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  document.body.style.display = 'flex'
  document.body.style.justifyContent = 'center'
  document.body.style.alignItems = 'center'
  document.body.style.height = '95vh'


  
  canvas.width = 650;
  canvas.height = 650;
  canvas.style.border = '1px solid black';
  
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  const circles: Circle[] = [];
  let draggedCircle: Circle | null = null;
  let prevMousePosition: { x: number; y: number } | null = null;
  
  const getRandomNumber = () => {
    return Math.floor(Math.random() * colors.length);
  };
  
  const handleCanvasClick = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
    const circle = circles.find(
      (circle) => Math.hypot(circle.x - x, circle.y - y) < circle.sharav
    );
  
    if (!circle) {
      const newCircle: Circle = { 
        x, y, sharav: 20, speedX: 0, speedY: 0, hold: false, qash: 4, color: colors[getRandomNumber()] 
      };
      circles.push(newCircle);
    }
  };
  
  const handleMouseDown = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const circle = circles.find(
      (circle) => Math.hypot(circle.x - x, circle.y - y) < circle.sharav
    );
    if (circle) {
      circle.hold = true;
      draggedCircle = circle;
      prevMousePosition = { x, y };
    }
  };
  
  const handleMouseMove = (event: MouseEvent) => {
    if (draggedCircle) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      draggedCircle.x = x;
      draggedCircle.y = y;
    }
  };
  
  const handleMouseUp = (event: MouseEvent) => {
    if (draggedCircle && prevMousePosition) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const deltaX = x - prevMousePosition.x;
      const deltaY = y - prevMousePosition.y;
      const time = 100; 
  
      draggedCircle.speedX = deltaX / time;
      draggedCircle.speedY = deltaY / time;
  
      draggedCircle.hold = false;
      draggedCircle = null;
      prevMousePosition = null;
    }
  };
  
  
  const drawCircle = (circle: Circle, context: CanvasRenderingContext2D) => {
    context.beginPath();
    context.arc(circle.x, circle.y, circle.sharav, 0, Math.PI * 2);
    context.fillStyle = circle.color;
    context.fill();
    context.stroke();
  };
  
  const checkCollisions = () => {
    for (let i = 0; i < circles.length; i++) {
      for (let j = i + 1; j < circles.length; j++) {
        const circle1 = circles[i];
        const circle2 = circles[j];
        const speedX = circle2.x - circle1.x;
        const speedY = circle2.y - circle1.y;
        const distance = Math.hypot(speedX, speedY);
  
        if (distance <= circle1.sharav + circle2.sharav) {
          const nx = speedX / distance;
          const ny = speedY / distance;
          const tx = -ny;
          const ty = nx;
  
          const dpTan1 = circle1.speedX * tx + circle1.speedY * ty;
          const dpTan2 = circle2.speedX * tx + circle2.speedY * ty;
  
          const dpNorm1 = circle1.speedX * nx + circle1.speedY * ny;
          const dpNorm2 = circle2.speedX * nx + circle2.speedY * ny;
  
          const m1 = (dpNorm1 * (circle1.qash - circle2.qash) + 2 * circle2.qash * dpNorm2) / (circle1.qash + circle2.qash);
          const m2 = (dpNorm2 * (circle2.qash - circle1.qash) + 2 * circle1.qash * dpNorm1) / (circle1.qash + circle2.qash);
  
          circle1.speedX = tx * dpTan1 + nx * m1;
          circle1.speedY = ty * dpTan1 + ny * m1;
          circle2.speedX = tx * dpTan2 + nx * m2;
          circle2.speedY = ty * dpTan2 + ny * m2;
  
          const overlap = 0.5 * (circle1.sharav + circle2.sharav - distance + 1);
          circle1.x -= overlap * nx;
          circle1.y -= overlap * ny;
          circle2.x += overlap * nx;
          circle2.y += overlap * ny;
        }
      }
    }
  };
  
  const updateCircles = () =>  
    { 
    context.clearRect(0, 0, canvas.width, canvas.height); 
   
    circles.forEach((circle) => { 
      if (!circle.hold) {  
        circle.speedY += gra * circle.qash;
        circle.x += circle.speedX; 
        circle.y += circle.speedY; 
   
        if (circle.x - circle.sharav < 0) { 
          circle.x = circle.sharav; 
          circle.speedX *= -(damp * 0.7);  
        } else if (circle.x + circle.sharav > canvas.width) { 
          circle.x = canvas.width - circle.sharav; 
          circle.speedX *= -damp; 
        } 
   
        if (circle.y - circle.sharav <= 0) { 
          circle.y = circle.sharav; 
          circle.speedY *= -damp; 
        }  if (circle.y + circle.sharav > canvas.height) { 
          circle.y = canvas.height - circle.sharav; 
          circle.speedY *= -damp; 
        } 
      } 
      drawCircle(circle, context); 
    }); 
   
    checkCollisions(); 
   
    if (prevMousePosition) { 
      const deltaX = circles[0].x - prevMousePosition.x; 
      const deltaY = circles[0].y - prevMousePosition.y; 
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); 
      const speed = distance / 5; 
      console.log('Mouse Speed:', speed); 
    } 
   
    requestAnimationFrame(updateCircles); 
  };
  
  canvas.addEventListener('click', handleCanvasClick);
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mouseleave', handleMouseUp); 
  
  updateCircles();
  