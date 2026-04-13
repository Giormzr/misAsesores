const HORAS_MATUTINO = [
    "7:00 - 7:50", "7:50 - 8:40", "8:40 - 9:30", "10:00 - 10:50", 
    "10:50 - 11:40", "11:40 - 12:30", "12:30 - 13:20", "13:20 - 14:10"
];

const HORAS_VESPERTINO = [
    "14:00 - 14:50", "14:50 - 15:40", "15:40 - 16:30", "16:50 - 17:40",
    "17:40 - 18:30", "18:30 - 19:20", "19:20 - 20:10", "20:10 - 21:00"
];

function dibujarTablaRegistro(turno = "Matutino", targetId = 'schedule-body', prefix = 'check-') {
    const body = document.getElementById(targetId);
    if (!body) return;
    body.innerHTML = '';

    const horas = (turno === "Vespertino") ? HORAS_VESPERTINO : HORAS_MATUTINO;

    horas.forEach((hora, rowIndex) => {
        let row = `<tr><td class="py-2 px-3 bg-slate-50 font-medium border-r border-slate-200">${hora}</td>`;
        for (let colIndex = 1; colIndex <= 5; colIndex++) {
            row += `
                <td class="p-1 border-r border-slate-100 text-center">
                    <input type="checkbox" id="${prefix}${rowIndex}-${colIndex}" class="schedule-checkbox w-5 h-5 rounded text-[#3b71ca] cursor-pointer">
                </td>`;
        }
        row += `</tr>`;
        body.insertAdjacentHTML('beforeend', row);
    });
}

window.dibujarHorarioPerfil = function(horarioGuardado, turno = "Matutino") {
    const body = document.getElementById('profile-schedule-body');
    if (!body) return;
    body.innerHTML = '';

    const horas = (turno === "Vespertino") ? HORAS_VESPERTINO : HORAS_MATUTINO;
    const dias = ["Hora", "Lun", "Mar", "Mie", "Jue", "Vie"];

    let header = '<tr class="bg-slate-50 text-slate-600 border-b">';
    dias.forEach(d => header += `<th class="py-2 font-medium">${d}</th>`);
    header += '</tr>';
    body.insertAdjacentHTML('beforeend', header);

    horas.forEach((hora, r) => {
        let row = `<tr class="border-b border-slate-50"><td class="py-2 font-medium bg-slate-50/50">${hora}</td>`;
        for (let c = 1; c <= 5; c++) {
            const activo = horarioGuardado.some(h => h.r === r && h.c === c);
            row += `<td class="py-2 text-center">${activo ? '✅' : '-'}</td>`;
        }
        row += '</tr>';
        body.insertAdjacentHTML('beforeend', row);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('schedule-body')) {
        dibujarTablaRegistro();
    }
});