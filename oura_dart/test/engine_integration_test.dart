import 'dart:convert';
import 'dart:io';

import 'package:test/test.dart';
import 'package:oura_dart/oura_engine.dart';
import 'package:oura_dart/oura_types.dart';

Map<String, dynamic> _loadJson(String path) {
  return jsonDecode(File(path).readAsStringSync()) as Map<String, dynamic>;
}

void main() {
  final trustStoreJson = _loadJson('test/fixtures/trust-store.json');
  final trustStore = OuraTrustStore.fromJson(trustStoreJson);

  group('engine integration', () {
    test('loadBundle + verifyLoadedBundle + evaluate works end to end', () {
      final bundle = _loadJson('test/fixtures/bundles/valid-bundle.json');

      final engine = OuraEngine(trustStore: trustStore);
      engine.loadBundle(jsonEncode(bundle));

      final verification = engine.verifyLoadedBundle(
        mode: VerificationMode.strict,
      );

      expect(verification.valid, true);
      expect(verification.status, 'VALID');
      expect(verification.stale, false);
      expect(engine.bundleId(), 'payments-prod-v12');
      expect(engine.policyVersion(), '1.0.0');

      final result = engine.evaluate({
        'amount': 1500,
        'new_ip': true,
      });

      expect(result.matched, true);
      expect(result.matchedRules, ['protect-payment']);
      expect(result.scores, isNotNull);
      expect(result.scores!.R, 0.9);
      expect(result.scores!.B, 0.8);
      expect(result.meta.ouraVersion, '1.0.0');
      expect(result.meta.selectedPriority, 100);
    });

    test('evaluate before verifyLoadedBundle fails', () {
      final bundle = _loadJson('test/fixtures/bundles/valid-bundle.json');

      final engine = OuraEngine(trustStore: trustStore);
      engine.loadBundle(jsonEncode(bundle));

      expect(
        () => engine.evaluate({
          'amount': 1500,
          'new_ip': true,
        }),
        throwsA(isA<Exception>()),
      );
    });
  });
}
