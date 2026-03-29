import 'dart:io';

import 'oura_errors.dart';

class OuraCache {
  final File file;

  OuraCache(this.file);

  void save(String data) {
    try {
      file.parent.createSync(recursive: true);
      file.writeAsStringSync(data);
    } catch (e) {
      throw CacheFailureError('Failed to save cache: $e');
    }
  }

  String load() {
    try {
      return file.readAsStringSync();
    } catch (e) {
      throw CacheFailureError('Failed to load cache: $e');
    }
  }
}
