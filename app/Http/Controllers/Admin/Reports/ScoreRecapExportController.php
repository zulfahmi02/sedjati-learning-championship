<?php

namespace App\Http\Controllers\Admin\Reports;

use App\Enums\ScoreSheetStatus;
use App\Http\Controllers\Controller;
use App\Models\EventSetting;
use App\Models\Round;
use App\Models\ScoreSheet;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ScoreRecapExportController extends Controller
{
    /**
     * Export the per-criterion score recap (all submitted sheets) as xlsx or pdf.
     */
    public function __invoke(Request $request): Response
    {
        $format = $request->string('format')->value() ?: 'xlsx';

        $rounds = Round::query()->with('criteria')->orderBy('sequence')->get();

        $sheets = ScoreSheet::query()
            ->where('status', ScoreSheetStatus::Submitted)
            ->with(['participant.panels:id,name', 'judge:id,name', 'scores'])
            ->get()
            ->groupBy('round_id');

        $eventName = EventSetting::current()->event_name;

        if ($format === 'pdf') {
            return Pdf::loadView('reports.score-recap', [
                'eventName' => $eventName,
                'rounds' => $rounds,
                'sheets' => $sheets,
                'generatedAt' => now(),
            ])->setPaper('a4', 'landscape')->download('rekap-nilai-slc.pdf');
        }

        return new StreamedResponse(function () use ($rounds, $sheets) {
            $writer = new Writer;
            $writer->openToFile('php://output');

            foreach ($rounds as $index => $round) {
                $sheet = $index === 0
                    ? $writer->getCurrentSheet()
                    : $writer->addNewSheetAndMakeItCurrent();
                $sheet->setName(mb_substr($round->name, 0, 31));

                $writer->addRow(Row::fromValues([
                    'No. Peserta',
                    'Nama',
                    'Panel',
                    'Juri',
                    ...$round->criteria->map(fn ($criterion) => $criterion->name.' ('.$criterion->weight.'%)'),
                    'Skor Ronde',
                ]));

                foreach ($sheets->get($round->id, collect()) as $scoreSheet) {
                    $values = $scoreSheet->scores->pluck('value', 'criterion_id');

                    $roundScore = $round->criteria->sum(
                        fn ($criterion) => ((float) ($values[$criterion->id] ?? 0)) / $criterion->max_score * 100 * $criterion->weight / 100,
                    );

                    $writer->addRow(Row::fromValues([
                        $scoreSheet->participant->participant_number,
                        $scoreSheet->participant->name,
                        $scoreSheet->participant->panels->first()?->name,
                        $scoreSheet->judge->name,
                        ...$round->criteria->map(fn ($criterion) => (float) ($values[$criterion->id] ?? 0)),
                        round($roundScore, 2),
                    ]));
                }
            }

            $writer->close();
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="rekap-nilai-slc.xlsx"',
        ]);
    }
}
