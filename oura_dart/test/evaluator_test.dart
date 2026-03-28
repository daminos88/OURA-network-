import 'dart:convert';
import 'dart:io';

import 'package:test/test.dart';
import 'package:oura_dart/oura_evaluator.dart';

Map<String, dynamic> _loadJson(String path) {
  return jsonDecode(File(path).readAsStringSync()) as Map<String, dynamic>;
}

void main() {
  final suite = _loadJson('test/fixtures/evaluation/local-eval-cases.json');
  final cases = suite['cases'] as List<dynamic>;

  group('evaluator', () {
    for (final rawCase in cases) {
      final testCase = rawCase as Map<String, dynamic>;
      final name = testCase['name'] as String;
      final policy = testCase['policy'] as Map<String, dynamic>;
      final context = testCase['context'] as Map<String, dynamic>;
      final expected = testCase['expected'] as Map<String, dynamic>;

      test(name, () {
        final evaluator = OuraEvaluator(policy);
        final result = evaluator.evaluate(context);

        expect(result.matched, expected['matched']);
        expect(result.matchedRules, expected['matched_rules']);

        final expectedScores = expected['scores'];
        if (expectedScores == null) {
          expect(result.scores, isNull);
        } else {
          expect(result.scores, isNotNull);
          expect(result.scores!.R, expectedScores['R']);
          expect(result.scores!.B, expectedScores['B']);
        }
      });
    }
  });
}
