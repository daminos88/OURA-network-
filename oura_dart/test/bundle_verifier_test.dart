import 'dart:convert';
import 'dart:io';

import 'package:test/test.dart';
import 'package:oura_dart/oura_engine.dart';
import 'package:oura_dart/oura_types.dart';
import 'package:oura_dart/oura_errors.dart';

Map<String, dynamic> _loadJson(String path) {
  final file = File(path);
  return jsonDecode(file.readAsStringSync()) as Map<String, dynamic>;
}

void main() {
  final trustStoreJson = _loadJson('test/fixtures/trust-store.json');
  final trustStore = OuraTrustStore.fromJson(trustStoreJson);

  group('bundle verifier', () {
    test('valid strict bundle returns VALID', () {
      final bundle = _loadJson('test/fixtures/bundles/valid-bundle.json');

      final engine = OuraEngine(trustStore: trustStore);
      engine.loadBundle(jsonEncode(bundle));

      final result = engine.verifyLoadedBundle(
        mode: VerificationMode.strict,
      );

      expect(result.valid, true);
      expect(result.status, 'VALID');
      expect(result.stale, false);
      expect(result.bundleId, 'payments-prod-v12');
    });

    test('expired strict bundle throws expired bundle error', () {
      final bundle = _loadJson('test/fixtures/bundles/expired-bundle.json');

      final engine = OuraEngine(trustStore: trustStore);
      engine.loadBundle(jsonEncode(bundle));

      expect(
        () => engine.verifyLoadedBundle(
          mode: VerificationMode.strict,
          now: 1910000000,
        ),
        throwsA(isA<ExpiredBundleError>()),
      );
    });

    test('allow stale bundle returns STALE_BUNDLE_ALLOWED', () {
      final bundle = _loadJson('test/fixtures/bundles/allow-stale-bundle.json');

      final engine = OuraEngine(trustStore: trustStore);
      engine.loadBundle(jsonEncode(bundle));

      final result = engine.verifyLoadedBundle(
        mode: VerificationMode.allowStale,
        now: 1910000000,
      );

      expect(result.valid, true);
      expect(result.status, 'STALE_BUNDLE_ALLOWED');
      expect(result.stale, true);
    });

    test('invalid signature throws InvalidSignatureError', () {
      final bundle = _loadJson('test/fixtures/bundles/invalid-signature.json');

      final engine = OuraEngine(trustStore: trustStore);
      engine.loadBundle(jsonEncode(bundle));

      expect(
        () => engine.verifyLoadedBundle(mode: VerificationMode.strict),
        throwsA(isA<InvalidSignatureError>()),
      );
    });

    test('unknown key throws UnknownKeyIdError', () {
      final bundle = _loadJson('test/fixtures/bundles/unknown-key.json');

      final engine = OuraEngine(trustStore: trustStore);
      engine.loadBundle(jsonEncode(bundle));

      expect(
        () => engine.verifyLoadedBundle(mode: VerificationMode.strict),
        throwsA(isA<UnknownKeyIdError>()),
      );
    });

    test('invalid embedded policy throws InvalidPolicyError', () {
      final bundle = _loadJson('test/fixtures/bundles/invalid-policy-bundle.json');

      final engine = OuraEngine(trustStore: trustStore);
      engine.loadBundle(jsonEncode(bundle));

      expect(
        () => engine.verifyLoadedBundle(mode: VerificationMode.strict),
        throwsA(isA<InvalidPolicyError>()),
      );
    });
  });
}
