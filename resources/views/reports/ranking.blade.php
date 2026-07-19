<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Rekap Ranking — {{ $eventName }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #171d1c; }
        h1 { font-size: 16px; margin-bottom: 2px; }
        .meta { color: #6d7a77; margin-bottom: 14px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #bcc9c6; padding: 5px 7px; text-align: left; }
        th { background: #eaefed; font-size: 10px; text-transform: uppercase; }
        td.num, th.num { text-align: right; }
        tr.top td { background: #f0f5f2; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Rekap Peringkat Akhir</h1>
    <p class="meta">{{ $eventName }} — dibuat {{ $generatedAt->translatedFormat('d F Y H:i') }}</p>

    <table>
        <thead>
            <tr>
                <th class="num">Peringkat</th>
                <th>No. Peserta</th>
                <th>Nama</th>
                <th>Institusi</th>
                <th>Panel</th>
                @foreach ($rounds as $round)
                    <th class="num">{{ $round->name }} ({{ $round->weight }}%)</th>
                @endforeach
                <th class="num">Skor Akhir</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($standings as $entry)
                <tr @class(['top' => $entry['rank'] <= 3])>
                    <td class="num">{{ $entry['rank'] }}</td>
                    <td>{{ $entry['participant']->participant_number }}</td>
                    <td>{{ $entry['participant']->name }}</td>
                    <td>{{ $entry['participant']->institution }}</td>
                    <td>{{ $entry['participant']->panels->first()?->name }}</td>
                    @foreach ($rounds as $round)
                        <td class="num">{{ $entry['rounds'][$round->id] !== null ? number_format($entry['rounds'][$round->id], 2) : '—' }}</td>
                    @endforeach
                    <td class="num">{{ number_format($entry['total'], 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
