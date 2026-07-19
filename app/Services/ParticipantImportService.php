<?php

namespace App\Services;

use App\Models\Participant;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use OpenSpout\Reader\CSV\Reader as CsvReader;
use OpenSpout\Reader\XLSX\Reader as XlsxReader;

class ParticipantImportService
{
    /**
     * Expected column order: participant_number, name, institution, category.
     *
     * @return array{imported: int, errors: array<int, string>}
     */
    public function import(UploadedFile $file): array
    {
        $rows = $this->readRows($file);

        $imported = 0;
        $errors = [];

        DB::transaction(function () use ($rows, &$imported, &$errors) {
            foreach ($rows as $index => $row) {
                $line = $index + 2; // 1-based + header row

                $data = [
                    'participant_number' => $row[0] ?? '',
                    'name' => $row[1] ?? '',
                    'institution' => ($row[2] ?? '') ?: null,
                    'category' => ($row[3] ?? '') ?: null,
                ];

                $validator = Validator::make($data, [
                    'participant_number' => ['required', 'string', 'max:50', 'unique:participants,participant_number'],
                    'name' => ['required', 'string', 'max:255'],
                    'institution' => ['nullable', 'string', 'max:255'],
                    'category' => ['nullable', 'string', 'max:255'],
                ]);

                if ($validator->fails()) {
                    $errors[] = 'Baris '.$line.': '.implode(' ', $validator->errors()->all());

                    continue;
                }

                Participant::create($data);
                $imported++;
            }
        });

        return ['imported' => $imported, 'errors' => $errors];
    }

    /**
     * Read data rows (skipping the header row) from an xlsx/csv file.
     *
     * @return array<int, array<int, string>>
     */
    private function readRows(UploadedFile $file): array
    {
        $reader = strtolower($file->getClientOriginalExtension()) === 'xlsx'
            ? new XlsxReader
            : new CsvReader;

        $reader->open($file->getRealPath());

        $rows = [];

        foreach ($reader->getSheetIterator() as $sheet) {
            foreach ($sheet->getRowIterator() as $rowIndex => $row) {
                if ($rowIndex === 1) {
                    continue; // header
                }

                $cells = array_map(
                    fn ($cell) => trim(is_scalar($cell) || $cell instanceof \Stringable ? (string) $cell : ''),
                    $row->toArray(),
                );

                if (implode('', $cells) === '') {
                    continue; // blank row
                }

                $rows[] = $cells;
            }

            break; // first sheet only
        }

        $reader->close();

        return $rows;
    }
}
