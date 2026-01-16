<script>
class PhysicsCards {
    constructor() {
        this.container = document.getElementById('physicsContainer');
        this.cards = document.querySelectorAll('.physics-card');
        this.containerRect = this.container.getBoundingClientRect();
        this.isDragging = false;
        this.dragCard = null;
        this.velocity = {};
        
        this.init();
    }
    
    init() {
        // События для карт
        this.cards.forEach(card => {
            card.addEventListener('mousedown', this.startDrag.bind(this));
            card.addEventListener('touchstart', this.startDragTouch.bind(this));
        });
        
        // Глобальные события
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.stopDrag.bind(this));
        document.addEventListener('touchmove', this.dragTouch.bind(this));
        document.addEventListener('touchend', this.stopDrag.bind(this));
        
        // Кнопки
        document.getElementById('shuffleBtn').addEventListener('click', () => this.shuffle());
        document.getElementById('throwBtn').addEventListener('click', () => this.throwAll());
        
        // Имитация гравитации
        setInterval(() => this.applyPhysics(), 16); // ~60 FPS
    }
    
    startDrag(e) {
        e.preventDefault();
        this.isDragging = true;
        this.dragCard = e.currentTarget;
        this.dragCard.classList.add('dragging');
        
        const rect = this.dragCard.getBoundingClientRect();
        this.offsetX = e.clientX - rect.left;
        this.offsetY = e.clientY - rect.top;
        
        this.velocity[this.dragCard] = { x: 0, y: 0 };
    }
    
    startDragTouch(e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            this.isDragging = true;
            this.dragCard = e.currentTarget;
            this.dragCard.classList.add('dragging');
            
            const touch = e.touches[0];
            const rect = this.dragCard.getBoundingClientRect();
            this.offsetX = touch.clientX - rect.left;
            this.offsetY = touch.clientY - rect.top;
        }
    }
    
    drag(e) {
        if (!this.isDragging || !this.dragCard) return;
        
        const x = e.clientX - this.containerRect.left - this.offsetX;
        const y = e.clientY - this.containerRect.top - this.offsetY;
        
        this.setCardPosition(this.dragCard, x, y);
    }
    
    dragTouch(e) {
        if (!this.isDragging || !this.dragCard || e.touches.length !== 1) return;
        
        const touch = e.touches[0];
        const x = touch.clientX - this.containerRect.left - this.offsetX;
        const y = touch.clientY - this.containerRect.top - this.offsetY;
        
        this.setCardPosition(this.dragCard, x, y);
    }
    
    setCardPosition(card, x, y) {
        // Границы контейнера
        x = Math.max(0, Math.min(x, this.containerRect.width - card.offsetWidth));
        y = Math.max(0, Math.min(y, this.containerRect.height - card.offsetHeight));
        
        card.style.left = x + 'px';
        card.style.top = y + 'px';
    }
    
    stopDrag() {
        if (!this.isDragging || !this.dragCard) return;
        
        this.isDragging = false;
        this.dragCard.classList.remove('dragging');
        
        // Придаем карте инерцию
        if (this.lastX !== undefined && this.lastY !== undefined) {
            const currentX = parseInt(this.dragCard.style.left);
            const currentY = parseInt(this.dragCard.style.top);
            
            this.velocity[this.dragCard] = {
                x: (currentX - this.lastX) * 0.5,
                y: (currentY - this.lastY) * 0.5
            };
        }
        
        this.lastX = null;
        this.lastY = null;
        this.dragCard = null;
    }
    
    applyPhysics() {
        if (this.isDragging && this.dragCard) {
            this.lastX = parseInt(this.dragCard.style.left);
            this.lastY = parseInt(this.dragCard.style.top);
            return;
        }
        
        this.cards.forEach(card => {
            if (card === this.dragCard) return;
            
            if (!this.velocity[card]) {
                this.velocity[card] = { x: 0, y: 0 };
            }
            
            let x = parseInt(card.style.left) + this.velocity[card].x;
            let y = parseInt(card.style.top) + this.velocity[card].y;
            
            // Столкновение с границами
            if (x < 0) {
                x = 0;
                this.velocity[card].x *= -0.7; // Отскок
            } else if (x > this.containerRect.width - card.offsetWidth) {
                x = this.containerRect.width - card.offsetWidth;
                this.velocity[card].x *= -0.7;
            }
            
            if (y < 0) {
                y = 0;
                this.velocity[card].y *= -0.7;
            } else if (y > this.containerRect.height - card.offsetHeight) {
                y = this.containerRect.height - card.offsetHeight;
                this.velocity[card].y *= -0.7;
            }
            
            // "Трение"
            this.velocity[card].x *= 0.98;
            this.velocity[card].y *= 0.98;
            
            // Минимальная скорость
            if (Math.abs(this.velocity[card].x) < 0.1) this.velocity[card].x = 0;
            if (Math.abs(this.velocity[card].y) < 0.1) this.velocity[card].y = 0;
            
            this.setCardPosition(card, x, y);
        });
    }
    
    shuffle() {
        this.cards.forEach(card => {
            const x = Math.random() * (this.containerRect.width - card.offsetWidth);
            const y = Math.random() * (this.containerRect.height - card.offsetHeight);
            
            card.style.transition = 'all 0.5s ease';
            this.setCardPosition(card, x, y);
            
            // Немного вращения
            card.style.transform = `rotate(${Math.random() * 60 - 30}deg)`;
            
            setTimeout(() => {
                card.style.transition = '';
            }, 500);
        });
    }
    
    throwAll() {
        this.cards.forEach(card => {
            // Придаем случайную скорость
            this.velocity[card] = {
                x: (Math.random() - 0.5) * 20,
                y: (Math.random() - 0.5) * 20
            };
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PhysicsCards();
});
</script>