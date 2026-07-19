<?php

namespace App\Http\Controllers\Admin\Reports;

use App\Http\Controllers\Controller;
use App\Models\EventSetting;
use App\Models\Round;
use App\Services\ScoreCalculationService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RankingExportController extends Controller
{
    /**
     * Export the overall ranking recap as xlsx or pdf.
     */
    public function __invoke(Request $request, ScoreCalculationService $calculator): Response
    {
        $format = $request->string('format')->value() ?: 'xlsx';

        $rounds = Round::query()->orderBy('sequence')->get();
        $standings = $calculator->overallStandings();
        $eventName = EventSetting::current()->event_name;

        if ($format === 'pdf') {
            return Pdf::loadView('reports.ranking', [
                'eventName' => $eventName,
                'rounds' => $rounds,
                'standings' => $standings,
                'generatedAt' => now(),
            ])->download('rekap-ranking-slc.pdf');
        }

        return new StreamedResponse(function () use ($rounds, $standings) {
            $writer = new Writer;
            $writer->openToFile('php://output');

            $writer->addRow(Row::fromValues([
                'Peringkat',
                'No. Peserta',
                'Nama',
                'Institusi',
                'Panel',
                ...$rounds->map(fn (Round $round) => $round->name.' ('.$round->weight.'%)'),
                'Skor Akhir',
            ]));

            foreach ($standings as $entry) {
                $writer->addRow(Row::fromValues([
                    $entry['rank'],
                    $entry['participant']->participant_number,
                    $entry['participant']->name,
                    $entry['participant']->institution,
                    $entry['participant']->panels->first()?->name,
                    ...$rounds->map(fn (Round $round) => $entry['rounds'][$round->id] ?? null),
                    $entry['total'],
                ]));
            }

            $writer->close();
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="rekap-ranking-slc.xlsx"',
        ]);
    }
}
