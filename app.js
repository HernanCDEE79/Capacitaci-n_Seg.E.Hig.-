// URL de Google Apps Script - REEMPLAZAR CON TU URL
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxzBs6OFQPuCex8yN-DcZrs1yxCu0A8rAT5jG53upwIc5N8NKIz1XD2Wu-hsKKG6J_a/exec';

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
// Datos del usuario
let userData = {
    nombre: '',
    apellido: '',
    dni: '',
    empresa: '',
    fecha: '',
    hora: '',
    puntaje: 0,
    aprobado: false,
    firma: ''
};

// Preguntas de la trivia (15 preguntas de verdadero/falso)
const preguntas = [
    {
        pregunta: "Al sonar la alarma de evacuación, se debe comenzar a evacuar sin correr pero con paso acelerado.",
        respuesta: true
    },
    {
        pregunta: "Está permitido perder tiempo en recoger pertenencias personales durante una evacuación.",
        respuesta: false
    },
    {
        pregunta: "Se debe usar el ascensor durante una evacuación de emergencia.",
        respuesta: false
    },
    {
        pregunta: "Al levantar una carga, siempre se debe agarrar con las dos manos y colocarla lo más cerca del cuerpo.",
        respuesta: true
    },
    {
        pregunta: "Se puede hacer movimientos bruscos al manipular cargas pesadas.",
        respuesta: false
    },
    {
        pregunta: "Es obligatorio mantener limpio y ordenado el lugar de trabajo.",
        respuesta: true
    },
    {
        pregunta: "Está permitido dejar objetos tirados en el suelo del depósito.",
        respuesta: false
    },
    {
        pregunta: "El E.P.P. que se entregue será de uso obligatorio y es responsabilidad del colaborador mantenerlo en buen estado.",
        respuesta: true
    },
    {
        pregunta: "Se puede usar el teléfono mientras se maneja o camina dentro del depósito.",
        respuesta: false
    },
    {
        pregunta: "Es obligatorio verificar el equipo antes de usar cualquier maquinaria.",
        respuesta: true
    },
    {
        pregunta: "Se debe tirar del cable para desconectar un equipo eléctrico.",
        respuesta: false
    },
    {
        pregunta: "Antes de comenzar a trabajar se debe verificar el estado de la bocina, sistemas de freno y alarma de retroceso.",
        respuesta: true
    },
    {
        pregunta: "Es correcto sobrecargarse de envoltorios en los rincones, debajo de los estantes y/o detrás de las puertas.",
        respuesta: false
    },
    {
        pregunta: "Al usar un extintor, primero se debe quitar el precinto y la traba, luego colocarse a 3 metros de distancia del fuego.",
        respuesta: true
    },
    {
        pregunta: "Es obligatorio usar siempre el casco dentro de las calles de los racks.",
        respuesta: true
    }
];

let respuestasUsuario = new Array(preguntas.length).fill(null);

// Elementos DOM
const sections = {
    registro: document.getElementById('registro'),
    triptico: document.getElementById('triptico'),
    trivia: document.getElementById('trivia'),
    resultado: document.getElementById('resultado'),
    confirmacion: document.getElementById('confirmacion')
};

// Formulario de registro
document.getElementById('registroForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    userData.nombre = document.getElementById('nombre').value.trim();
    userData.apellido = document.getElementById('apellido').value.trim();
    userData.dni = document.getElementById('dni').value.trim();
    userData.empresa = document.getElementById('empresa').value.trim();
    
    const now = new Date();
    userData.fecha = now.toLocaleDateString('es-AR');
    userData.hora = now.toLocaleTimeString('es-AR');
    
    mostrarSeccion('triptico');
});

// Botón de descarga
document.getElementById('downloadBtn').addEventListener('click', () => {
    try {
        // Crear un link temporal para descargar el PDF
        const link = document.createElement('a');
        link.href = 'Triptico_Seguridad.pdf';
        link.download = 'Normas_Seguridad_Carrefour.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Mostrar mensaje de confirmación
        setTimeout(() => {
            alert('✅ Descarga iniciada.');
        }, 100);
    } catch (error) {
        console.error('Error al descargar:', error);
        alert('Error al descargar el archivo. Por favor, intente nuevamente.');
    }
});

// Botón iniciar trivia - PERMITE ACCEDER SIN DESCARGA
document.getElementById('iniciarTrivia').addEventListener('click', () => {
    mostrarSeccion('trivia');
    renderizarPreguntas();
});

// Renderizar preguntas
function renderizarPreguntas() {
    const container = document.getElementById('triviaContainer');
    container.innerHTML = '';
    
    preguntas.forEach((pregunta, index) => {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.innerHTML = `
            <div class="question-number">Pregunta ${index + 1} de ${preguntas.length}</div>
            <div class="question-text">${pregunta.pregunta}</div>
            <div class="answer-options">
                <button class="answer-btn" data-index="${index}" data-value="true">
                    ✓ Verdadero
                </button>
                <button class="answer-btn" data-index="${index}" data-value="false">
                    ✗ Falso
                </button>
            </div>
        `;
        container.appendChild(questionCard);
    });
    
    // Event listeners para las respuestas
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            const value = e.target.dataset.value === 'true';
            
            // Remover selección anterior
            const siblings = e.target.parentElement.querySelectorAll('.answer-btn');
            siblings.forEach(s => s.classList.remove('selected'));
            
            // Agregar selección actual
            e.target.classList.add('selected');
            
            // Guardar respuesta
            respuestasUsuario[index] = value;
            
            // Actualizar progreso
            actualizarProgreso();
            
            // Habilitar botón finalizar si todas están respondidas
            const todasRespondidas = respuestasUsuario.every(r => r !== null);
            document.getElementById('finalizarTrivia').disabled = !todasRespondidas;
        });
    });
}

// Actualizar barra de progreso
function actualizarProgreso() {
    const respondidas = respuestasUsuario.filter(r => r !== null).length;
    const porcentaje = (respondidas / preguntas.length) * 100;
    document.getElementById('progressFill').style.width = porcentaje + '%';
}

// Finalizar trivia
document.getElementById('finalizarTrivia').addEventListener('click', () => {
    calcularPuntaje();
    mostrarSeccion('resultado');
});

// Calcular puntaje
function calcularPuntaje() {
    let correctas = 0;
    
    preguntas.forEach((pregunta, index) => {
        if (respuestasUsuario[index] === pregunta.respuesta) {
            correctas++;
        }
    });
    
    userData.puntaje = correctas;
    userData.aprobado = correctas >= 11; // 70% de 15 = 10.5, redondeamos a 11
    
    // Mostrar resultado
    const scoreNumber = document.getElementById('scoreNumber');
    const scoreText = document.getElementById('scoreText');
    const statusText = document.getElementById('statusText');
    
    scoreNumber.textContent = correctas;
    scoreText.textContent = `de ${preguntas.length} correctas`;
    
    if (userData.aprobado) {
        scoreNumber.classList.remove('fail');
        statusText.innerHTML = '🎉 <strong style="color: #0047BA;">¡APROBADO!</strong>';
        statusText.innerHTML += '<br><span style="font-size: 16px; color: #666;">Ha alcanzado el 70% requerido</span>';
        document.getElementById('aproboSection').style.display = 'block';
        document.getElementById('reproboSection').style.display = 'none';
        inicializarFirma();
    } else {
        scoreNumber.classList.add('fail');
        statusText.innerHTML = '❌ <strong style="color: #dc3545;">NO APROBADO</strong>';
        statusText.innerHTML += '<br><span style="font-size: 16px; color: #666;">Necesita al menos 11 respuestas correctas</span>';
        document.getElementById('aproboSection').style.display = 'none';
        document.getElementById('reproboSection').style.display = 'block';
    }
}

// Reintentar
document.getElementById('reintentar').addEventListener('click', () => {
    respuestasUsuario = new Array(preguntas.length).fill(null);
    mostrarSeccion('trivia');
    renderizarPreguntas();
    actualizarProgreso();
    document.getElementById('finalizarTrivia').disabled = true;
});

// Sistema de firma
let canvas, ctx, isDrawing = false;
let lastX = 0, lastY = 0;

function inicializarFirma() {
    canvas = document.getElementById('signaturePad');
    ctx = canvas.getContext('2d');
    
    // Ajustar el tamaño del canvas para dispositivos de alta resolución
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Event listeners para mouse
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Event listeners para touch
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    lastX = x;
    lastY = y;
}

function stopDrawing() {
    isDrawing = false;
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (e.type === 'touchstart') {
        isDrawing = true;
        lastX = x;
        lastY = y;
    } else if (e.type === 'touchmove' && isDrawing) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastX = x;
        lastY = y;
    }
}

// Limpiar firma
document.getElementById('clearSignature').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Enviar capacitación
document.getElementById('submitSignature').addEventListener('click', async () => {
    // Verificar que haya firma
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let hasDrawing = false;
    
    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] !== 0) { // Alpha channel
            hasDrawing = true;
            break;
        }
    }
    
    if (!hasDrawing) {
        alert('⚠️ Por favor, firme antes de enviar.');
        return;
    }
    
    // Convertir firma a base64
    userData.firma = canvas.toDataURL();
    
    // Deshabilitar botón mientras se envía
    const submitBtn = document.getElementById('submitSignature');
    submitBtn.disabled = true;
    submitBtn.textContent = '📤 Enviando...';
    
    try {
        await enviarDatos();
        mostrarSeccion('confirmacion');
    } catch (error) {
        console.error('Error al enviar:', error);
        alert('❌ Error al enviar los datos. Por favor, intente nuevamente.');
        submitBtn.disabled = false;
        submitBtn.textContent = '✅ Enviar Capacitación';
    }
});

// Enviar datos a Google Sheets
async function enviarDatos() {
    const data = {
        nombre: userData.nombre,
        apellido: userData.apellido,
        dni: userData.dni,
        empresa: userData.empresa,
        fecha: userData.fecha,
        hora: userData.hora,
        puntaje: userData.puntaje,
        aprobado: userData.aprobado ? 'SÍ' : 'NO',
        firma: userData.firma
    };
    
    const response = await fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    // Con mode: 'no-cors' no podemos leer la respuesta, pero el envío se realiza
    return new Promise(resolve => setTimeout(resolve, 1000));
}

// Función auxiliar para cambiar de sección
function mostrarSeccion(nombreSeccion) {
    Object.keys(sections).forEach(key => {
        sections[key].classList.remove('active');
    });
    sections[nombreSeccion].classList.add('active');
    window.scrollTo(0, 0);
}

}); // Fin del DOMContentLoaded
