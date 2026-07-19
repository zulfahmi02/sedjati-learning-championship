<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Rekap Nilai — {{ $eventName }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #171d1c; }
        h1 { font-size: 16px; margin-bottom: 2px; }
        h2 { font-size: 13px; margin: 16px 0 6px; }
        .meta { color: #6d7a77; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        th, td { border: 1px solid #bcc9c6; padding: 4px 6px; text-align: left; }
        th { background: #eaefed; font-size: 9px; text-transform: uppercase; }
        td.num, th.num { text-align: right; }
        .empty { color: #6d7a77; font-style: italic; }
    </style>
</head>
<body>
    <h1>Rekap Nilai per Kriteria</h1>
    <p class="meta">{{ $eventName }} — dibuat {{ $generatedAt->translatedFormat('d F Y H:i') }}</p>

    @foreach ($rounds as $round)
        <h2>{{ $round->name }} (bobot {{ $round->weight }}%)</h2>
        @php $roundSheets = $sheets->get($round->id, collect()); @endphp

        @if ($roundSheets->isEmpty())
            <p class="empty">Belum ada nilai terkirim pada ronde ini.</p>
        @else
            <table>
                <thead>
                    <tr>
                        <th>No. Peserta</th>
                        <th>Nama</th>
                        <th>Panel</th>
                        <th>Juri</th>
                        @foreach ($round->criteria as $criterion)
                            <th class="num">{{ $criterion->name }} ({{ $criterion->weight }}%)</th>
                        @endforeach
                        <th class="num">Skor Ronde</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($roundSheets as $sheet)
                        @php
                            $values = $sheet->scores->pluck('value', 'criterion_id');
                            $roundScore = $round->criteria->sum(
                                fn ($criterion) => ((float) ($values[$criterion->id] ?? 0)) / $criterion->max_score * 100 * $criterion->weight / 100,
                            );
                        @endphp
                        <tr>
                            <td>{{ $sheet->participant->participant_number }}</td>
                            <td>{{ $sheet->participant->name }}</td>
                            <td>{{ $sheet->participant->panels->first()?->name }}</td>
                            <td>{{ $sheet->judge->name }}</td>
                            @foreach ($round->criteria as $criterion)
                                <td class="num">{{ isset($values[$criterion->id]) ? number_format((float) $values[$criterion->id], 1) : '—' }}</td>
                            @endforeach
                            <td class="num">{{ number_format($roundScore, 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    @endforeach
</body>
</html>
